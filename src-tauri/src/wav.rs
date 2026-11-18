//! 16-bit PCM WAV writing (Morse tone export) and WAV reading (for the audio decoder).

use serde::Deserialize;

use crate::error::{AppError, AppResult};

/// One element of a Morse timeline: a tone (`on`) or a silence, with its length.
#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ToneEvent {
    pub on: bool,
    pub duration_ms: f64,
}

pub const EXPORT_SAMPLE_RATE: u32 = 44_100;
const RAMP_SECONDS: f64 = 0.005; // 5 ms click-free attack and release

/// Renders a Morse timeline to a mono 16-bit PCM WAV file.
///
/// The sine phase runs continuously across the whole file and each tone gets a 5 ms
/// raised-cosine attack and release, so the result has no key clicks.
pub fn render_morse_wav(events: &[ToneEvent], pitch_hz: f64, volume: f64) -> AppResult<Vec<u8>> {
    if !(100.0..=3000.0).contains(&pitch_hz) {
        return Err(AppError::Invalid(
            "The tone pitch must be between 100 and 3000 Hz.".into(),
        ));
    }
    let volume = volume.clamp(0.0, 1.0);
    let rate = f64::from(EXPORT_SAMPLE_RATE);

    // Convert event boundaries to sample positions from the running total, so rounding
    // never accumulates into timing drift.
    let mut boundaries = Vec::with_capacity(events.len() + 1);
    let mut elapsed_ms = 0.0;
    boundaries.push(0usize);
    for ev in events {
        if !ev.duration_ms.is_finite() || ev.duration_ms < 0.0 {
            return Err(AppError::Invalid(
                "A Morse element has an invalid length.".into(),
            ));
        }
        elapsed_ms += ev.duration_ms;
        boundaries.push((elapsed_ms / 1000.0 * rate).round() as usize);
    }
    let total = *boundaries.last().unwrap_or(&0);
    if total > EXPORT_SAMPLE_RATE as usize * 60 * 30 {
        return Err(AppError::Invalid(
            "The message is too long to export (30 minutes maximum).".into(),
        ));
    }

    let mut samples = vec![0i16; total];
    let ramp = (RAMP_SECONDS * rate) as usize;
    let omega = 2.0 * std::f64::consts::PI * pitch_hz / rate;

    for (i, ev) in events.iter().enumerate() {
        if !ev.on {
            continue;
        }
        let (start, end) = (boundaries[i], boundaries[i + 1]);
        let len = end - start;
        let edge = ramp.min(len / 2).max(1);
        for (offset, slot) in samples[start..end].iter_mut().enumerate() {
            let from_end = len - offset;
            let env = if offset < edge {
                0.5 - 0.5 * (std::f64::consts::PI * offset as f64 / edge as f64).cos()
            } else if from_end <= edge {
                0.5 - 0.5 * (std::f64::consts::PI * from_end as f64 / edge as f64).cos()
            } else {
                1.0
            };
            let value = ((start + offset) as f64 * omega).sin() * env * volume * 32_767.0;
            *slot = value.round().clamp(-32_768.0, 32_767.0) as i16;
        }
    }

    Ok(encode_pcm16(&samples, EXPORT_SAMPLE_RATE))
}

fn encode_pcm16(samples: &[i16], sample_rate: u32) -> Vec<u8> {
    let data_len = (samples.len() * 2) as u32;
    let mut out = Vec::with_capacity(44 + data_len as usize);
    out.extend_from_slice(b"RIFF");
    out.extend_from_slice(&(36 + data_len).to_le_bytes());
    out.extend_from_slice(b"WAVEfmt ");
    out.extend_from_slice(&16u32.to_le_bytes()); // fmt chunk size
    out.extend_from_slice(&1u16.to_le_bytes()); // PCM
    out.extend_from_slice(&1u16.to_le_bytes()); // mono
    out.extend_from_slice(&sample_rate.to_le_bytes());
    out.extend_from_slice(&(sample_rate * 2).to_le_bytes()); // byte rate
    out.extend_from_slice(&2u16.to_le_bytes()); // block align
    out.extend_from_slice(&16u16.to_le_bytes()); // bits per sample
    out.extend_from_slice(b"data");
    out.extend_from_slice(&data_len.to_le_bytes());
    for s in samples {
        out.extend_from_slice(&s.to_le_bytes());
    }
    out
}

/// Decoded audio: mono samples in the range -1.0..=1.0.
pub struct MonoAudio {
    pub sample_rate: u32,
    pub samples: Vec<f32>,
}

/// Reads a WAV file (PCM 8/16/24/32-bit or 32-bit float, any channel count) and mixes it to mono.
pub fn read_wav(bytes: &[u8]) -> AppResult<MonoAudio> {
    let bad = |msg: &str| AppError::Audio(msg.to_string());
    if bytes.len() < 12 || &bytes[0..4] != b"RIFF" || &bytes[8..12] != b"WAVE" {
        return Err(bad("only WAV files are supported."));
    }

    let mut pos = 12;
    let mut format: Option<(u16, u16, u32, u16)> = None; // (tag, channels, rate, bits)
    let mut data: Option<&[u8]> = None;

    while pos + 8 <= bytes.len() {
        let id = &bytes[pos..pos + 4];
        let size = u32::from_le_bytes([
            bytes[pos + 4],
            bytes[pos + 5],
            bytes[pos + 6],
            bytes[pos + 7],
        ]) as usize;
        let body_start = pos + 8;
        let body_end = body_start.saturating_add(size).min(bytes.len());
        let body = &bytes[body_start..body_end];

        if id == b"fmt " {
            if body.len() < 16 {
                return Err(bad("the format block is damaged."));
            }
            let mut tag = u16::from_le_bytes([body[0], body[1]]);
            let channels = u16::from_le_bytes([body[2], body[3]]);
            let rate = u32::from_le_bytes([body[4], body[5], body[6], body[7]]);
            let bits = u16::from_le_bytes([body[14], body[15]]);
            if tag == 0xFFFE && body.len() >= 26 {
                tag = u16::from_le_bytes([body[24], body[25]]); // WAVE_FORMAT_EXTENSIBLE
            }
            format = Some((tag, channels, rate, bits));
        } else if id == b"data" {
            data = Some(body);
        }
        pos = body_start + size + (size & 1); // chunks are word-aligned
    }

    let (tag, channels, sample_rate, bits) =
        format.ok_or_else(|| bad("no format block was found."))?;
    let data = data.ok_or_else(|| bad("no sound data was found."))?;
    if channels == 0 || sample_rate == 0 {
        return Err(bad("the channel count or sample rate is zero."));
    }

    let bytes_per_sample = usize::from(bits / 8);
    let decode: fn(&[u8]) -> f32 = match (tag, bits) {
        (1, 8) => |b| (f32::from(b[0]) - 128.0) / 128.0,
        (1, 16) => |b| f32::from(i16::from_le_bytes([b[0], b[1]])) / 32_768.0,
        (1, 24) => |b| (i32::from_le_bytes([0, b[0], b[1], b[2]]) >> 8) as f32 / 8_388_608.0,
        (1, 32) => |b| i32::from_le_bytes([b[0], b[1], b[2], b[3]]) as f32 / 2_147_483_648.0,
        (3, 32) => |b| f32::from_le_bytes([b[0], b[1], b[2], b[3]]),
        _ => {
            return Err(bad(
                "this kind of WAV encoding is not supported (use 8, 16, 24 or 32-bit PCM).",
            ));
        }
    };

    let frame = bytes_per_sample * usize::from(channels);
    let samples = data
        .chunks_exact(frame)
        .map(|f| {
            let sum: f32 = f.chunks_exact(bytes_per_sample).map(decode).sum();
            sum / f32::from(channels)
        })
        .collect();

    Ok(MonoAudio {
        sample_rate,
        samples,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ev(on: bool, ms: f64) -> ToneEvent {
        ToneEvent {
            on,
            duration_ms: ms,
        }
    }

    #[test]
    fn header_and_length_are_correct() {
        // "A" at 20 WPM: 60 on, 60 off, 180 on = 300 ms
        let wav = render_morse_wav(
            &[ev(true, 60.0), ev(false, 60.0), ev(true, 180.0)],
            600.0,
            0.8,
        )
        .expect("render");
        assert_eq!(&wav[0..4], b"RIFF");
        assert_eq!(&wav[8..16], b"WAVEfmt ");
        let samples = (wav.len() - 44) / 2;
        assert_eq!(
            samples,
            (0.3 * f64::from(EXPORT_SAMPLE_RATE)).round() as usize
        );
    }

    #[test]
    fn gaps_are_silent_and_edges_are_ramped() {
        let wav = render_morse_wav(
            &[ev(true, 60.0), ev(false, 60.0), ev(true, 60.0)],
            600.0,
            1.0,
        )
        .expect("render");
        let audio = read_wav(&wav).expect("read back");
        let gap_start = (0.060 * 44_100.0) as usize + 5;
        let gap_end = (0.120 * 44_100.0) as usize - 5;
        assert!(audio.samples[gap_start..gap_end].iter().all(|s| *s == 0.0));
        assert!(
            audio.samples[0].abs() < 0.01,
            "attack must start from silence"
        );
        let peak = audio.samples.iter().fold(0.0f32, |m, s| m.max(s.abs()));
        assert!(
            peak > 0.95,
            "full volume should reach near full scale, got {peak}"
        );
    }

    #[test]
    fn zero_volume_is_silent() {
        let wav = render_morse_wav(&[ev(true, 100.0)], 600.0, 0.0).expect("render");
        assert!(wav[44..].iter().all(|b| *b == 0));
    }

    #[test]
    fn rejects_bad_input() {
        assert!(render_morse_wav(&[ev(true, -5.0)], 600.0, 0.5).is_err());
        assert!(render_morse_wav(&[ev(true, 50.0)], 20.0, 0.5).is_err());
        assert!(read_wav(b"not a wav file at all").is_err());
    }

    #[test]
    fn reads_stereo_by_mixing_to_mono() {
        let mut wav = encode_pcm16(&[1000, 3000, -2000, -4000], 8000);
        // Patch the header to 2 channels: block align 4, byte rate 32000.
        wav[22..24].copy_from_slice(&2u16.to_le_bytes());
        wav[28..32].copy_from_slice(&32_000u32.to_le_bytes());
        wav[32..34].copy_from_slice(&4u16.to_le_bytes());
        let audio = read_wav(&wav).expect("read");
        assert_eq!(audio.samples.len(), 2);
        assert!((audio.samples[0] - 2000.0 / 32_768.0).abs() < 1e-6);
        assert!((audio.samples[1] + 3000.0 / 32_768.0).abs() < 1e-6);
    }
}

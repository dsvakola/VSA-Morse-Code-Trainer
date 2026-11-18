//! Finds the Morse tone in a recording and turns it into a list of tone / silence lengths.
//!
//! 1. Find the strongest tone between 300 and 1500 Hz (Goertzel scan over the loudest blocks).
//! 2. Measure that tone's strength in 5 ms blocks.
//! 3. Pick an on/off threshold between the quiet floor and the signal level, with hysteresis.
//! 4. Merge very short glitches and return the segments. The front end turns these into text
//!    with the same classifier used by the sending practice room.

use serde::Serialize;

use crate::error::{AppError, AppResult};
use crate::wav::MonoAudio;

#[derive(Debug, Clone, Copy, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Segment {
    pub on: bool,
    pub duration_ms: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DecodedSignal {
    pub tone_hz: f64,
    pub duration_ms: f64,
    pub segments: Vec<Segment>,
}

const BLOCK_MS: f64 = 5.0;
const MIN_HZ: f64 = 300.0;
const MAX_HZ: f64 = 1500.0;

fn goertzel_power(block: &[f32], freq: f64, rate: f64) -> f64 {
    let coeff = 2.0 * (2.0 * std::f64::consts::PI * freq / rate).cos();
    let (mut s1, mut s2) = (0.0f64, 0.0f64);
    for &x in block {
        let s0 = f64::from(x) + coeff * s1 - s2;
        s2 = s1;
        s1 = s0;
    }
    (s1 * s1 + s2 * s2 - coeff * s1 * s2) / (block.len().max(1) as f64).powi(2)
}

fn find_tone(audio: &MonoAudio) -> Option<f64> {
    let rate = f64::from(audio.sample_rate);
    let win = ((0.025 * rate) as usize).max(64); // 25 ms windows for frequency resolution
    let mut windows: Vec<(f32, &[f32])> = audio
        .samples
        .chunks(win)
        .filter(|c| c.len() == win)
        .map(|c| (c.iter().map(|s| s * s).sum::<f32>(), c))
        .collect();
    if windows.is_empty() {
        return None;
    }
    windows.sort_by(|a, b| b.0.total_cmp(&a.0));
    let loud = &windows[..windows.len().min(40)];

    let mut best = (0.0f64, 0.0f64);
    let mut freq = MIN_HZ;
    while freq <= MAX_HZ.min(rate / 2.0 - 50.0) {
        let power: f64 = loud
            .iter()
            .map(|(_, w)| goertzel_power(w, freq, rate))
            .sum();
        if power > best.1 {
            best = (freq, power);
        }
        freq += 10.0;
    }
    (best.1 > 0.0).then_some(best.0)
}

/// Decodes the on/off pattern of the dominant tone in a recording.
pub fn decode_signal(audio: &MonoAudio) -> AppResult<DecodedSignal> {
    let rate = f64::from(audio.sample_rate);
    let duration_ms = audio.samples.len() as f64 / rate * 1000.0;
    if duration_ms < 50.0 {
        return Err(AppError::Audio("the recording is too short.".into()));
    }
    let tone_hz = find_tone(audio)
        .ok_or_else(|| AppError::Audio("no Morse tone was found in the recording.".into()))?;

    let block = ((BLOCK_MS / 1000.0 * rate) as usize).max(16);
    let levels: Vec<f64> = audio
        .samples
        .chunks(block)
        .map(|c| goertzel_power(c, tone_hz, rate).sqrt())
        .collect();

    let mut sorted = levels.clone();
    sorted.sort_by(f64::total_cmp);
    let floor = sorted[sorted.len() / 10];
    let peak = sorted[(sorted.len() * 95 / 100).min(sorted.len() - 1)];
    if peak <= floor * 2.0 || peak < 1e-4 {
        return Err(AppError::Audio(
            "the tone is too weak or too noisy to separate from the background.".into(),
        ));
    }
    let high = floor + (peak - floor) * 0.5;
    let low = floor + (peak - floor) * 0.3;

    // Threshold with hysteresis into raw on/off blocks.
    let mut on = false;
    let mut raw: Vec<Segment> = Vec::new();
    for level in levels {
        if on && level < low {
            on = false;
        } else if !on && level > high {
            on = true;
        }
        match raw.last_mut() {
            Some(seg) if seg.on == on => seg.duration_ms += BLOCK_MS,
            _ => raw.push(Segment {
                on,
                duration_ms: BLOCK_MS,
            }),
        }
    }

    Ok(DecodedSignal {
        tone_hz,
        duration_ms,
        segments: clean_segments(raw),
    })
}

/// Removes glitches shorter than 12 ms (by merging them into their neighbours) and trims the
/// silence before the first tone and after the last one.
pub fn clean_segments(raw: Vec<Segment>) -> Vec<Segment> {
    const GLITCH_MS: f64 = 12.0;
    let mut out: Vec<Segment> = Vec::new();
    for seg in raw {
        if seg.duration_ms < GLITCH_MS
            && let Some(prev) = out.last_mut()
        {
            prev.duration_ms += seg.duration_ms;
            continue;
        }
        match out.last_mut() {
            Some(prev) if prev.on == seg.on => prev.duration_ms += seg.duration_ms,
            _ => out.push(seg),
        }
    }
    while out.first().is_some_and(|s| !s.on) {
        out.remove(0);
    }
    while out.last().is_some_and(|s| !s.on) {
        out.pop();
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::wav::{ToneEvent, read_wav, render_morse_wav};

    fn tone(on: bool, ms: f64) -> ToneEvent {
        ToneEvent {
            on,
            duration_ms: ms,
        }
    }

    /// "SOS" at 20 WPM (60 ms unit) with lead-in and tail silence.
    fn sos_events() -> Vec<ToneEvent> {
        let mut v = vec![tone(false, 300.0)];
        let letter = |v: &mut Vec<ToneEvent>, len: f64| {
            for i in 0..3 {
                v.push(tone(true, len));
                if i < 2 {
                    v.push(tone(false, 60.0));
                }
            }
        };
        letter(&mut v, 60.0);
        v.push(tone(false, 180.0));
        letter(&mut v, 180.0);
        v.push(tone(false, 180.0));
        letter(&mut v, 60.0);
        v.push(tone(false, 300.0));
        v
    }

    #[test]
    fn decodes_clean_sos_timing() {
        let wav = render_morse_wav(&sos_events(), 700.0, 0.8).expect("render");
        let audio = read_wav(&wav).expect("read");
        let decoded = decode_signal(&audio).expect("decode");

        assert!(
            (decoded.tone_hz - 700.0).abs() <= 20.0,
            "tone {}",
            decoded.tone_hz
        );
        let tones: Vec<f64> = decoded
            .segments
            .iter()
            .filter(|s| s.on)
            .map(|s| s.duration_ms)
            .collect();
        assert_eq!(tones.len(), 9, "segments: {:?}", decoded.segments);
        for (i, ms) in tones.iter().enumerate() {
            let expected = if (3..6).contains(&i) { 180.0 } else { 60.0 };
            assert!(
                (ms - expected).abs() <= 15.0,
                "element {i}: {ms} ms vs {expected}"
            );
        }
        assert!(decoded.segments.first().is_some_and(|s| s.on));
        assert!(decoded.segments.last().is_some_and(|s| s.on));
    }

    #[test]
    fn decodes_through_background_noise() {
        let wav = render_morse_wav(&sos_events(), 600.0, 0.6).expect("render");
        let mut audio = read_wav(&wav).expect("read");
        // Deterministic pseudo-random noise at about -26 dB.
        let mut seed: u32 = 12345;
        for s in &mut audio.samples {
            seed = seed.wrapping_mul(1_103_515_245).wrapping_add(12_345);
            let n = ((seed >> 16) as f32 / 32_768.0) - 1.0;
            *s += n * 0.05;
        }
        let decoded = decode_signal(&audio).expect("decode");
        let count = decoded.segments.iter().filter(|s| s.on).count();
        assert_eq!(count, 9);
    }

    #[test]
    fn silence_is_reported_clearly() {
        let audio = MonoAudio {
            sample_rate: 8000,
            samples: vec![0.0; 8000],
        };
        assert!(decode_signal(&audio).is_err());
    }

    #[test]
    fn glitches_are_merged_and_edges_trimmed() {
        let raw = vec![
            Segment {
                on: false,
                duration_ms: 100.0,
            },
            Segment {
                on: true,
                duration_ms: 60.0,
            },
            Segment {
                on: false,
                duration_ms: 5.0,
            },
            Segment {
                on: true,
                duration_ms: 55.0,
            },
            Segment {
                on: false,
                duration_ms: 200.0,
            },
        ];
        assert_eq!(
            clean_segments(raw),
            vec![Segment {
                on: true,
                duration_ms: 120.0
            }]
        );
    }
}

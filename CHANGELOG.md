# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] - 2026-11-17

### Changed

- **New name:** the application is now **VSA Morse Code Trainer** (window title, installer, About, README and all documents). App identifier is now `in.edu.vsa.morse-code-trainer`.
- **New application icon:** an old straight telegraph key in tarnished brass on a rusted iron plate, with "VSA" punched above it in Morse (`assets/brand/app-icon.svg`), plus a simplified variant for 16–32 px. The `.ico` now carries 16, 24, 32, 48, 64, 128 and 256 px images.
- **Single version source:** `src-tauri/tauri.conf.json`; the About page reads it from the desktop shell.
- **Windows packaging:** NSIS installer only; release profile tuned for size (`opt-level = "s"`).
- **One-click build:** `build.bat` installs with pnpm, builds, and places the portable EXE and the installer in the `Release` folder.

- **Privacy policy** added (`privacy-policy.md`): fully offline, no personal data collected.
- **README** rewritten for the new name and the Rust + TypeScript stack.

### Fixed

- Key-tapping decoder read letters made only of dahs as dits (for example "O" was decoded as "S").
- Morse-to-text turned `+ = & (` into prosign tags; ordinary text now round-trips correctly.
- Sidetone could remain sounding after a very quick key tap; it now has its own audio voice.
- Stop no longer clicks; looping now leaves a word gap between repeats.
- Background noise now follows the volume control.
- The signal lamp now shows which character is being sent.
- WAV export honours a volume of 0%.

## [0.5.0] - 2026-11-17

### Added

- **Historical Morse Fundamentals Course (`src/features/fundamentals/FundamentalsPage.tsx`):** Original 10-chapter educational curriculum authored for Vidyasagar Academy by Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar. Covers auditory learning reflexes, 1-3-7 timing rules, the standard word "PARIS", Farnsworth spacing, letter frequency & information theory, prosigns, Q-signals & etiquette, sending mistakes, telegraph history (1844 Baltimore line to RMS Titanic), and emergency safety signaling.
- **Interactive 1-3-7 Animated Timeline Demo (`src/components/morse/AnimatedTimelineDemo.tsx`):** Step-by-step visual timeline synchronizing audio sounder playback with proportional brass unit blocks (1T, 3T, 7T).
- **Interactive PARIS 50-Unit Counter Demo (`src/components/morse/ParisUnitCounterDemo.tsx`):** Real-time cumulative unit counter verifying the exact 50-unit structure of the standard word "PARIS" and proving the $1200 / \text{WPM}$ relationship.
- **Interactive Farnsworth Slider Demo (`src/components/morse/FarnsworthSliderDemo.tsx`):** Dual-slider comparison tool contrasting modern Farnsworth timing against obsolete sluggish slow-code moaning.
- **Interactive Chapter Quizzes:** Embedded comprehension questions per chapter with instant feedback, explanations, and auto-completion tracking.
- **Persistent Reading Progress:** Local storage progress manager recording read chapters and computing overall curriculum mastery.
- **Automated Fundamentals Tests (`tests/unit/fundamentals.test.ts`):** Vitest test suite verifying the structure of all 10 chapters and proving mathematical PARIS unit calculations.

## [0.4.0] - 2026-11-17

### Added

- **Telegraph Reference Ledger & Archive (`src/features/reference/ReferencePage.tsx`):** Comprehensive tabbed reference system covering Letters (A–Z), Numbers (0–9), Punctuation marks, Operating Prosigns, Radio Q-Signals, CW Abbreviations, Mirror Pairs, and historical International vs. American Morse comparison.
- **Consistent Proportional Morse Graphics (`src/components/morse/DotDashGraphic.tsx`):** Visual element renderer drawing rounded dots and exact 3× width rounded dash bars in metallic brass styling.
- **Audible Rhythm Preview:** Per-character sounder playback buttons allowing students to listen to any letter, number, prosign, or Q-code at their customized speed, pitch, and noise level.
- **Printable Chart & Official PDF Generator (`src/utils/pdf-chart-export.ts`):** Client-side 2-page A4 PDF reference chart generator via `jsPDF`, branded with Vidyasagar Academy credits, ITU standards notes, and licensing attributions.
- **Structured Content Archives (`src/content/`):** Dedicated datasets for 14 standard radio Q-codes (`qcodes.json`), 36 operational abbreviations (`abbreviations.json`), and American landline vs. Continental wireless historical comparisons (`american-vs-international.json`).
- **Live Search & Filter:** Instant search filtering across character names, dots and dashes, spoken rhythms ("di-dah"), memory hooks, and operational meanings.
- **Automated Reference Tests (`tests/unit/reference.test.ts`):** Vitest test suite verifying completeness of all mandatory Q-codes, abbreviations, and historical datasets.

## [0.3.0] - 2026-11-17

### Added

- **Vintage Telegraph Station Aesthetic:** Complete visual overhaul implementing antique walnut and bakelite consoles, warm aged telegram parchment papers, burnished brass instruments, and incandescent vacuum-tube pilot lamps, fully cataloged in `suggestions.md`.
- **Sample-Accurate Web Audio Engine (`src/audio/playback.ts`):** High-precision Web Audio API oscillator scheduling with `AudioContext.currentTime` and 5 ms attack/release ramps to prevent key clicks.
- **Atmospheric QRM/QRN Generator (`src/audio/noise.ts`):** Bandpass-filtered pink noise generator simulating real-world HF atmospheric crackle and radio interference.
- **16-Bit PCM WAV Exporter (`src/audio/wav-export.ts`):** Client-side generator exporting uncompressed 16-bit mono 44.1 kHz WAV files using the exact same click-free gain envelope as live playback.
- **Optical Filament Pilot Lamp (`src/components/morse/OpticalSignalLamp.tsx`):** Authentic vintage pilot light glowing warm amber in synchronization with audio dits and dahs, with full-screen optical telegraphy flash mode.
- **Telegraph Translator Console (`src/features/translator/TranslatorPage.tsx`):** Live bidirectional Text ↔ Morse converter, character counter, clipboard copy, audio sounder controls (play, stop, loop), WAV exporter, and historical example telegraph dispatches.
- **Interactive Timing Calculator (`src/components/morse/TimingCalculator.tsx`):** Interactive visual timeline and millisecond breakdown for PARIS 50-unit standard and Farnsworth gap stretching.
- **Telegraph Station Settings (`src/features/settings/SettingsPage.tsx`):** Full configuration controls for pitch, volume, speeds, noise, keyer triggers, and local JSON backup export.
- **Unit Test Coverage:** Added WAV generator verification suite testing RIFF, WAVE, fmt, and data chunk integrity.

## [0.2.0] - 2026-11-17

### Added

- **Core Pure-TypeScript Morse Engine:** Standalone, zero-dependency module implementing International Morse Code (ITU-R M.1677).
- **Comprehensive Character Table:** Complete mappings for 26 letters (A–Z), 10 numerals (0–9), 17 punctuation marks, and 7 operational prosigns (`<AR>`, `<SK>`, `<BT>`, `<AS>`, `<KN>`, `<SOS>`, `<HH>`).
- **Robust Encoder & Tolerant Decoder:** Bidirectional encoding and decoding accepting alternative glyphs (`·`, `•`, `–`, `—`, `−`) and reporting unknown patterns.
- **ITU & Farnsworth Timing Math:** Implementation of the standard 1-3-7 unit timing rule, the standard word "PARIS" (50 units), `1200 / WPM` unit duration, and standard ARRL Farnsworth delay formula.
- **Event Scheduler:** Sample-accurate discrete `{ on | off, durationMs }` timeline generator.
- **Mirror Pairs & Symmetries:** Systematic helper identifying inverse pairs and palindromic self-mirrors.
- **Ludwig Koch Ear Trainer Logic:** Standard 36-character progression (`K M U R E S N A P T ...`), lesson 1 initialization (K, M), and `>= 90%` unlock rule.
- **Auto-Calibrating Keyer Classifier:** Live stream analyzer estimating operator unit duration and classifying presses and gaps into discrete Morse elements.
- **Sending Quality Scoring:** Multi-factor scoring engine evaluating textual Levenshtein accuracy, dash-to-dot ratio, and gap spacing.

## [0.1.0] - 2026-11-17

### Added

- **Project Architecture & Scaffold:** Tauri 2 desktop shell with React 19, TypeScript, and Vite.
- **Strict Package Manager Guard:** `packageManager: pnpm@12.18.0` with `only-allow pnpm` preinstall enforcement.
- **Brand & Visual Identity:** Vidyasagar Academy logo integration with auto-generated multi-resolution `.ico` and Store tiles.
- **Styling & Design System:** Tailwind CSS 4 with custom palette sampled from Vidyasagar Academy brand colours.
- **Application Navigation Shell:** Responsive desktop layout featuring side navigation, breadcrumb header, daily practice timer, streak counter, and active profile status.
- **Home Dashboard:** Welcome hero banner, today's goal tracker, curriculum progress ring, and direct room shortcuts.
- **About Window:** Complete developer attributions to Prof. Dattaraj S. Vidyasagar & Prof. Yash D. Vidyasagar, official links, GPLv3 license terms, related resources, and safety notes.

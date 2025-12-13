# Speech to Text

This project is an attempt at making speech to text work. It uses [sounddevice](https://github.com/spatialaudio/sounddevice) to record audio and [OpenAI Whisper](https://github.com/openai/whisper) to transcribe audio.

## Overview

Two approaches were tried:

- "Live" transcription: Recording audio in chunks of 2 seconds and transcribing them as they come in.
- Record then transcribe: Recording the entire audio and then transcribing it all at once.

The model used for transcription is `tiny.en` as it is the smallest and fastest, but only supports English. See [Setup](#setup) for instructions on how to select a different model.

## Lesson Learned

Doing live transcription on fixed chunks is not ideal because it can end up splitting audios mid-word or mid-sentence, leading to inaccurate transcriptions. A better solution would be to split the audio at the end of a sentence or at a natural pause.

## Prerequisites

- [Python](https://www.python.org/downloads/)
- [uv](https://docs.astral.sh/uv/): A Python package and project manager

## "Live" Transcription

```bash
uv run live_transcription.py
```

Attempt 1 at transcribing "The quick brown fox jumps over the lazy dog":
```
The quick brilliant....
flux jumps over the...
lazy dog
```

Attempt 2:
```
The quick brown fox.
jumps over the lazy dog.
```

## Record then Transcribe

```bash
uv run record_then_transcribe.py
```

Attempt 1 at transcribing "The quick brown fox jumps over the lazy dog":
```
The quick brown socks jumps over the lazy dog.
```

Attempt 2:
```
The quick brown fox jumps over the lazy dog.
```

## Setup

### Models

There are different models available for transcription, which affect the accuracy, speed, and language supported. To see the available models, run the following command:

```bash
uv run python
import whisper
whisper.available_models()
```

To select a different model, change the model name in the code ([`live_transcription.py`](live_transcription.py) and [`record_then_transcribe.py`](record_then_transcribe.py)):

```python
model = whisper.load_model("tiny.en")
```

### Devices

For audio recording, the default input device is used. To see the available devices, run the following command:

```bash
uv run python
import sounddevice as sd
sd.query_devices()
```

On a Mac, the output will look something like this:

```
> 0 MacBook Air Microphone, Core Audio (1 in, 0 out)
< 1 MacBook Air Speakers, Core Audio (0 in, 2 out)
```

The number in front of the device name is the device index. Input devices are marked with `>` and have a non-zero number before the `in` keyword at the end of the line.

To select a different device, change the device index in the code ([`live_transcription.py`](live_transcription.py) and [`record_then_transcribe.py`](record_then_transcribe.py)):

```python
device = sd.query_devices(device=0)
```

### Chunk Size

The live transcription transcribes audio in chunks of 2 seconds.

To change the chunk size, change the `chunk_duration_seconds` variable in the code ([`live_transcription.py`](live_transcription.py)):

```python
chunk_duration_seconds = 2
```

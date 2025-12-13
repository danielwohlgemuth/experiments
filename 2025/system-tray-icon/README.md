# System Tray Icon

This is a simple proof of concept of the [pystray](https://github.com/moses-palmer/pystray) library to build a system tray icon with a dynamic icon and menu.

The icon can be in two states: idle and recording.

Idle state:
- The outer circle is blue.
- The first menu item says "Record".

![Idle Icon](assets/idle-icon.jpg)

Recording state:
- The outer circle is red.
- The first menu item says "Stop".

![Recording Icon](assets/recording-icon.jpg)

## Prerequisites

- [Python](https://www.python.org/downloads/)
- [uv](https://docs.astral.sh/uv/): A Python package and project manager

## Usage

```bash
uv run main.py
```

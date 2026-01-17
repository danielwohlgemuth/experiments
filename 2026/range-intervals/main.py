from tkinter import Tk, ttk, Canvas

from range_intervals import find_range_intervals

class Constants():
    class Text():
        BUTTON_CALCULATE = 'Calculate'
        LABEL_END = 'End'
        LABEL_ENTER_END = 'Enter an end number'
        LABEL_ENTER_START = 'Enter a start number'
        LABEL_ENTER_START_END = 'Start number must be less than end number'
        LABEL_ENTER_VALID_END = 'Enter a valid end number'
        LABEL_ENTER_VALID_START = 'Enter a valid start number'
        LABEL_INTRODUCTION = 'Please enter a start and end number, then click Calculate to see a list of intervals'
        LABEL_START = 'Start'
        TITLE = 'Range Intervals'

    class Canvas():
        TOP_OFFSET = 13
        MAX_HEIGHT = 130

TEXT = Constants.Text()
CANVAS = Constants.Canvas()

def is_float(text_number):
    try:
        float(text_number)
        return True
    except ValueError:
        return False

def validate(start, end):
    if not start:
        return TEXT.LABEL_ENTER_START
    if not end:
        return TEXT.LABEL_ENTER_END
    if start == end:
        return TEXT.LABEL_ENTER_START_END
    if not is_float(start):
        return TEXT.LABEL_ENTER_VALID_START
    if not is_float(end):
        return TEXT.LABEL_ENTER_VALID_END
    return ''

def setup_input(main_frame: ttk.Frame) -> tuple[ttk.Entry, ttk.Entry]:

    ttk.Label(main_frame, width=4, text=TEXT.LABEL_START) \
        .grid(column=0, row=0, pady=2)
    start_entry = ttk.Entry(main_frame, width=12)
    start_entry.grid(column=1, row=0, pady=2)
    start_entry.focus()

    ttk.Label(main_frame, width=4, text=TEXT.LABEL_END) \
        .grid(column=0, row=1, pady=2)
    end_entry = ttk.Entry(main_frame, width=12)
    end_entry.grid(column=1, row=1, pady=2)

    return start_entry, end_entry

def setup_output(
        main_frame: ttk.Frame,
        previous_output: ttk.Widget | None = None,
        text: str | None = None,
        intervals: list[float] | None = None,
        start: float | None = None,
        end: float | None = None,
    ) -> ttk.Widget:

    if previous_output:
        previous_output.destroy()

    if intervals:
        canvas = Canvas(main_frame, width=150, height=150, background='#333')
        canvas.grid(column=0, row=3, columnspan=2, pady=2)

        if len(intervals) < 2:
            return canvas

        interval_height = CANVAS.MAX_HEIGHT / (len(intervals) - 1)
        height = CANVAS.TOP_OFFSET

        # Draw Y axis
        canvas.create_line(3, CANVAS.TOP_OFFSET, 3, CANVAS.MAX_HEIGHT + CANVAS.TOP_OFFSET, fill='white')

        # Draw intervals
        for interval in intervals:
            canvas.create_line(0, height, 10, height, fill='white')
            canvas.create_text(15, height, text=interval, anchor='w', fill='white')
            height += interval_height

        # Calculate ratio of the height of the canvas to the difference between the start and end of the intervals
        ratio = (intervals[-1] - intervals[0]) / CANVAS.MAX_HEIGHT

        # Draw start
        start_height = CANVAS.TOP_OFFSET + (start - intervals[0]) / ratio
        canvas.create_line(0, start_height, 10, start_height, fill='green', width=3)

        # Draw end
        end_height = CANVAS.TOP_OFFSET + CANVAS.MAX_HEIGHT + (end - intervals[-1]) / ratio
        canvas.create_line(0, end_height, 10, end_height, fill='red', width=3)

        return canvas

    if not text:
        text = TEXT.LABEL_INTRODUCTION

    label = ttk.Label(main_frame, text=text, wraplength=150)
    label.grid(column=0, row=3, columnspan=2, pady=2)
    return label

def main():
    root = Tk()
    root.title(TEXT.TITLE)
    root.geometry(f'200x{150 + CANVAS.MAX_HEIGHT}')

    main_frame = ttk.Frame(root, padding=(3, 12))
    main_frame.grid(column=0, row=0)
    main_frame.place(relx=0.5, anchor='n')

    start_entry, end_entry = setup_input(main_frame)

    output = setup_output(main_frame)

    def on_calculate():
        nonlocal output
        start = start_entry.get()
        end = end_entry.get()
        validation = validate(start, end)
        if validation:
            output = setup_output(main_frame, previous_output=output, text=validation)
            return

        buckets = find_range_intervals(float(start), float(end))
        output = setup_output(main_frame, previous_output=output, intervals=buckets, start=float(start), end=float(end))

    ttk.Button(main_frame, text=TEXT.BUTTON_CALCULATE, command=on_calculate) \
        .grid(column=0, row=2, columnspan=2, pady=2)

    root.mainloop()

if __name__ == '__main__':
    main()
import math

def find_range_intervals(start: float, end: float) -> list[float]:
    if start == end:
        return [start]
    if start > end:
        return find_range_intervals(end, start)

    # Normalize the difference between the start and end to a value between 0 and 100
    diff = end - start
    diff_log10 = math.log10(diff)
    normalized_diff = diff * 10 ** (1 - math.floor(diff_log10))

    # Find the amount of intervals that would be generated for specific step sizes
    divided_by = {}
    divisors = [1, 2, 2.5, 5, 10, 20, 25, 50]
    for divisor in divisors:
        # Round the result to get "cleaner" numbers, e.g. 1.23 -> 1
        divided_by[divisor] = round(normalized_diff / divisor, 0)

    # Filter the step size that would generate between 5 and 10 intervals and pick the one with the least amount of intervals
    normalized_step_size = min((key for key, value in divided_by.items() if 5 <= value <= 10), key=lambda k: divided_by[k])
    step_size = normalized_step_size * 10 ** (math.floor(diff_log10) - 1)

    # Round the start and end to get "cleaner" numbers, e.g. 123 -> 120
    new_start = math.floor(start / step_size) * step_size
    new_end =  math.ceil(end / step_size) * step_size

    # Generate the intervals
    intervals = []
    step = new_start - step_size
    while step < new_end:
        step += step_size
        intervals.append(round(step, 2))
    return intervals

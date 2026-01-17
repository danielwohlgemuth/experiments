# Range Intervals

An app that shows the intervals between two numbers.

![range intervals 1 10](/2026/range-intervals/assets/range-intervals-1-10.png)

## Motivation

This project was inspired by how the labels on the vertical axis of a chart in Google Sheets used rounded numbers and the goal was to replicate that.

![google sheets chart](/2026/range-intervals/assets/google-sheets-chart.jpg)

Rounded numbers mean that only the most significant digits of the interval number should change. For example, the sequence 1, 1.5, 2 would be considered having rounded numbers. On the other hand, the sequence 1, 1.33, 1.66, 2 would not be considered, or at least be considered less desirable than the first sequence.

There were two main strategies that helped achieve satisfying results:
1. Use logarithm with base 10 to normalize the values to make it easier to work with numbers independent of their magnitude.
2. Consider only a limited number of interval sizes (1, 2, 2.5, and 5) to get the rounded numbers.

## How it works

At a high level, this is how the intervals are calculated:
1. First, the difference between the start and the end of the whole interval is calculated.
2. This difference is normalized using log10.
3. A few interval sizes are evaluated to determine how many intervals they would generate.
4. From those interval sizes, only the ones that would generate between 5 and 10 intervals are considered.
5. The interval size that would generate the fewest intervals is picked.
6. The interval size is denormalized by applying the inverse of log10 operation.
7. The start and end numbers are adjusted to have rounded numbers.
8. The intervals are generated using the adjusted start and end numbers and the denormalized interval size.

## Prerequisites

- [Python](https://www.python.org/downloads/)

## How to use

```bash
python3 main.py
```

## Results

![range intervals intro](/2026/range-intervals/assets/range-intervals-intro.png)
![range intervals -100 100](/2026/range-intervals/assets/range-intervals--100-100.png)
![range intervals 0.4 1.9](/2026/range-intervals/assets/range-intervals-0.4-1.9.png)
![range intervals 120 250](/2026/range-intervals/assets/range-intervals-120-250.png)
![range intervals 333 1280](/2026/range-intervals/assets/range-intervals-333-1280.png)
![range intervals 3000 9000](/2026/range-intervals/assets/range-intervals-3000-9000.png)

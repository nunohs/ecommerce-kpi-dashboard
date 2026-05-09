"""
test_calculations.py

This file tests the KPI calculation functions before connecting them to the API.

It prints the results in the terminal so we can check whether the numbers make
sense.

Simple explanation:
This file helps check the maths before showing the data on the dashboard.
"""

from calculations import get_all_metrics

metrics = get_all_metrics()

for key, value in metrics.items():
    print(f"\n{key}:")
    print(value)
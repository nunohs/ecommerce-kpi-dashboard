from calculations import get_all_metrics

metrics = get_all_metrics()

for key, value in metrics.items():
    print(f"\n{key}:")
    print(value)
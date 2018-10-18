import pandas as pd
from sodapy import Socrata


if __name__ == "__main__":
    client = Socrata("data.cityofchicago.org", None)

    results = client.get("fg6s-gzvg", limit=10000)

    results_df = pd.DataFrame.from_records(results)

    columns = ['start_time', 'trip_id', 'trip_duration']
    results = pd.DataFrame(results_df, columns=columns)

    results.to_csv('datasets/taxi_trips.csv', encoding='utf-8', index=False)

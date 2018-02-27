import pandas as pd
from sodapy import Socrata


if __name__ == "__main__":
    client = Socrata("data.sfgov.org", None)

    results = client.get("cuks-n6tp", limit=2000)

    results_df = pd.DataFrame.from_records(results)

    print(results_df)

import os

from google.cloud import bigquery


def query_stackoverflow():
    client = bigquery.Client()


    query_job = client.query("""
            SELECT 
                country_name ,
                value , 
                indicator_name 
            FROM `bigquery-public-data.world_bank_intl_debt.international_debt`
            WHERE year = 2018
            ORDER BY value ASC
            LIMIT 20""")

    results = query_job.result()

    for row in results:
        print("{} :\tValue {}$ \t Indicator {}  ".format(row.country_name, row.value, row.indicator_name))

    print("\n\n")
    print(results)


if __name__ == '__main__':
    os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = r'''My Project 45903-19497577793c.json'''
    query_stackoverflow()

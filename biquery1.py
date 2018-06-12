from bq_helper import BigQueryHelper

bq_assistant = BigQueryHelper(active_project='bigquery-public-data', dataset_name='bitcoin_blockchain')
query = """SELECT timestamp, 
                DATETIME(TIMESTAMP_MILLIS(timestamp)) as datetime,
                transaction_id AS trans_id,
                outputs.output_satoshis AS trans_satoshis
        FROM `bigquery-public-data.bitcoin_blockchain.transactions`
            JOIN UNNEST (outputs) AS outputs
        WHERE DATETIME(TIMESTAMP_MILLIS(timestamp)) BETWEEN (DATETIME(TIMESTAMP('2017-12-17 00:00:00'))) AND (DATETIME(TIMESTAMP('2017-12-17 23:59:59')))
        ORDER BY DATETIME(TIMESTAMP_MILLIS(timestamp))
        LIMIT 100000

"""
df = bq_assistant.query_to_pandas(query)
df['trans_satoshis'] = df['trans_satoshis'].apply(lambda x: float(x/100000000))
df.to_csv('dataset.csv', encoding='utf-8', index=False)

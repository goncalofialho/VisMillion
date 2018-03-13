import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

if __name__ == '__main__':
    df = pd.read_csv('datasets/Seattle_Police_Department_911_Incident_Response.csv', sep=",", chunksize=100,
                     low_memory=False, usecols=['Event Clearance Date', 'Event Clearance Group'])

    for chunk in df:
        print(chunk.head())



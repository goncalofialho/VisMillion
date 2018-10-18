import numpy as np
import pandas as pd

file = open('testfile.csv', 'w+')
dataset_time = 0


def linear_generation(size, delta_interval, vals, alfa_random, positive=True, prob_chance=50, prob_interval=[1, 100]):
    x = np.random.randint(delta_interval[0], delta_interval[1], size)
    y = np.linspace(vals[0], vals[1], size)
    global dataset_time
    dataset_time += np.sum(x)

    if positive:
        for i in range(0, len(x)):
            chance = np.random.randint(1, 100)
            if chance <= prob_chance:
                delta = np.random.randint(delta_interval[0], delta_interval[1])
                dataset_time += delta
                val = np.random.uniform(prob_interval[0], prob_interval[1])
                file.write(str(delta) + ',' + str(val) + '\n')
            file.write(str(x[i]) + ',' + str(y[i] + np.random.uniform(alfa_random[0], alfa_random[1]))+'\n')
    else:
        for i in range(len(x) - 1, -1, -1):
            chance = np.random.randint(1, 100)
            if chance <= prob_chance:
                delta = np.random.randint(delta_interval[0], delta_interval[1])
                dataset_time += delta
                val = np.random.uniform(prob_interval[0], prob_interval[1])
                file.write(str(delta) + ',' + str(val) + '\n')
            file.write(str(x[i]) + ',' + str(y[i] + np.random.uniform(alfa_random[0], alfa_random[1]))+'\n')


def constant_vals(size, delta_interval, vals, outliers={}, prob_chance=50, prob_interval=[1, 100]):
    x = np.random.randint(delta_interval[0], delta_interval[1], size)
    y = np.random.uniform(vals[0], vals[1], size)
    global dataset_time
    dataset_time += np.sum(x)

    for i in range(0, len(x)):
        chance = np.random.randint(1, 100)
        if chance <= prob_chance:
            delta = np.random.randint(delta_interval[0], delta_interval[1])
            dataset_time += delta
            val = np.random.uniform(prob_interval[0], prob_interval[1])
            file.write(str(delta) + ',' + str(val) + '\n')
        if i in outliers:
            file.write(str(x[i]) + ',' + str(outliers[i]) + '\n')
        else:
            file.write(str(x[i]) + ',' + str(y[i]) + '\n')


def mark_outlier():
    delta = np.random.randint(1, 10)
    global dataset_time
    dataset_time += delta
    file.write(str(delta) + ',' + str(np.random.uniform(110, 170)) + '\n')


def aggregation(moment, size ):
    file.seek(0)
    file.readline()
    return


if __name__ == '__main__':
    file.write('delta,trans_satoshis\n')
    ### CONSTANT
    size = 1150
    delta_interval = [10, 20]
    vals = [80, 90]
    constant_vals(size, delta_interval, vals, prob_chance=5, prob_interval=[35, 90])

    mark_outlier()
    ### DESCENDING
    size = 250
    delta_interval = [20, 80]
    vals = [20, 80]
    alfa_random = [-10, 10]
    linear_generation(size, delta_interval, vals, alfa_random, positive=False, prob_chance=10, prob_interval=[35, 65])

    mark_outlier()
    ### CONSTANT
    size = 150
    delta_interval = [100, 200]
    vals = [20, 30]
    constant_vals(size, delta_interval, vals, prob_chance=5, prob_interval=[30, 65])

    print("Dataset milliseconds: " + str(dataset_time))

""" 
    TEST 2 
    ### CONSTANT
    size = 150
    delta_interval = [50, 100]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90])
    mark_outlier()
    ### CONSTANT
    size = 40
    delta_interval = [10, 20]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=99, prob_interval=[90, 95])
    ### CONSTANT
    size = 250
    delta_interval = [50, 100]
    vals = [10, 70]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90], outliers={170: 150})
    ### CONSTANT
    size = 150
    delta_interval = [50, 100]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90])
    mark_outlier()
    ### CONSTANT
    size = 50
    delta_interval = [5, 15]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=99, prob_interval=[5, 10])
    ### CONSTANT
    size = 250
    delta_interval = [50, 100]
    vals = [10, 60]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90], outliers={150: 110})

    print("Dataset milliseconds: " + str(dataset_time))
"""


"""
    TEST 2
    
    ### CONSTANT
    size = 150
    delta_interval = [50, 100]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90])
    ### CONSTANT
    size = 40
    delta_interval = [10, 20]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=99, prob_interval=[90, 95])
    ### CONSTANT
    size = 250
    delta_interval = [50, 100]
    vals = [10, 70]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90], outliers={170: 150})
    ### CONSTANT
    size = 150
    delta_interval = [50, 100]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90])
    ### CONSTANT
    size = 50
    delta_interval = [5, 15]
    vals = [10, 65]
    constant_vals(size, delta_interval, vals, prob_chance=99, prob_interval=[5, 10])
    ### CONSTANT
    size = 250
    delta_interval = [50, 100]
    vals = [10, 60]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[10, 90], outliers={150: 110})





    print("Dataset milliseconds: " + str(dataset_time))
"""

"""
    TEST 3 
    
        ### CONSTANT
    size = 100
    delta_interval = [50, 100]
    vals = [30, 70]
    constant_vals(size, delta_interval, vals, prob_chance=15, prob_interval=[10, 90])
    mark_outlier()

    ### CONSTANT HIGH FLUX
    size = 600
    delta_interval = [3, 13]
    vals = [35, 65]
    constant_vals(size, delta_interval, vals, prob_chance=45, prob_interval=[25, 75])
    mark_outlier()

    ### CONSTANT
    size = 200
    delta_interval = [13, 50]
    vals = [20, 55]
    constant_vals(size, delta_interval, vals, prob_chance=45, prob_interval=[50, 90])
    mark_outlier()

    ### CONSTANT
    size = 650
    delta_interval = [10, 20]
    vals = [15, 35]
    constant_vals(size, delta_interval, vals, prob_chance=25, prob_interval=[5, 90])
    mark_outlier()

    ### CONSTANT
    size = 15
    delta_interval = [150, 250]
    vals = [20, 80]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[5, 90])
    #mark_outlier()
    ### CONSTANT
    size = 25
    delta_interval = [200, 350]
    vals = [20, 80]
    constant_vals(size, delta_interval, vals, prob_chance=0, prob_interval=[5, 90])
    mark_outlier()

    ### CONSTANT
    size = 250
    delta_interval = [10, 50]
    vals = [10, 75]
    constant_vals(size, delta_interval, vals, prob_chance=5, prob_interval=[75, 90])
    mark_outlier()

    ### CONSTANT
    size = 1800
    delta_interval = [1, 5]
    vals = [43, 88]
    constant_vals(size, delta_interval, vals, prob_chance=20, prob_interval=[10, 45])
    #mark_outlier()

    ### CONSTANT
    #size = 300
    #delta_interval = [3, 10]
    #vals = [43, 88]
    #constant_vals(size, delta_interval, vals, prob_chance=20, prob_interval=[10, 45])
    #mark_outlier()

    print("Dataset milliseconds: " + str(dataset_time))
"""


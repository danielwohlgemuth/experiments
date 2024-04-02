import argparse

parser = argparse.ArgumentParser("k-inverse-pairs")
parser.add_argument("array_length", help="Specifies the length of the array (1 <= array_length <= 1000).", type=int)
args = parser.parse_args()

def count_inverse_pairs(array):
    count = 0
    for i in range(len(array) - 1):
        for j in range(i,len(array)):
            if array[i] > array[j]:
                count += 1
    return count

def generate_permutations(array, available, num, histogram):
    if len(array) == num:
        # print('array', array)
        inverse_pairs = count_inverse_pairs(array)
        if inverse_pairs not in histogram:
            histogram[inverse_pairs] = 0
        histogram[inverse_pairs] += 1
        return
    
    for value in available:
        array.append(value)
        new_available = available.copy()
        new_available.remove(value)
        generate_permutations(array, new_available, num, histogram)
        array.pop()
    

num = args.array_length
assert 1 <= num and num <= 1000, "The array length should be between 1 and 1000"
array = []
available = set(range(0, num))
histogram = {}
for value in available:
    array.append(value)
    new_available = available.copy()
    new_available.remove(value)
    generate_permutations(array, new_available, num, histogram)
    array.pop()
print('histogram', histogram)

# [1,2,3]0
# [1,3,2]1
# [2,1,3]1
# [2,3,1]2
# [3,1,2]2
# [3,2,1]3

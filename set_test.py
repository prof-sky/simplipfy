import random as rand

rand.seed(100)
rand_val = [rand.randint(0, 20) for i in range(10)]

rand_val_shuf1 = rand_val.copy()
rand.shuffle(rand_val_shuf1)
rand_val_shuf2 = rand_val.copy()
rand.shuffle(rand_val_shuf2)

print(f"List with values        : {rand_val}")
print(f"shuffled list 1         : {rand_val_shuf1}")
print(f"shuffled list 2         : {rand_val_shuf2}")

set1 = set(rand_val)
set2 = set(rand_val_shuf1)
set3 = set(rand_val_shuf2)

print(f"set order initial list  : {list(set1)}")
print(f"set order shuffled list1: {list(set2)}")
print(f"set order shuffled list2: {list(set3)}")

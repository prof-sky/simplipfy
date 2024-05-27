import random as rand
from datetime import datetime

rand.seed((datetime.now()-datetime(1970,1,1)).total_seconds())
rand_val = [4, 14, 14, 5, 12, 11, 13, 16, 3, 17]

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
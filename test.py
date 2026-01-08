import pandas as pd
import numpy as np
import random

# Number of rows
ROWS = 100000  

# Crop definitions with realistic ranges
crops = {
    "rice":  {"N": (60,120), "P": (20,60), "K": (40,120), "pH": (5.5,7.0), "temp": (20,35), "rain": (100,250)},
    "wheat": {"N": (40,90),  "P": (20,50), "K": (30,90),  "pH": (6.0,7.5), "temp": (10,25), "rain": (50,120)},
    "maize": {"N": (40,100), "P": (20,60), "K": (30,120), "pH": (5.5,7.0), "temp": (18,32), "rain": (50,180)},
    "cotton":{"N": (80,140), "P": (30,70), "K": (50,150), "pH": (5.5,8.0), "temp": (20,40), "rain": (50,200)},
}

soil_types = ["Black", "Red", "Sandy", "Clay", "Loamy"]

data = []

for _ in range(ROWS):
    crop = random.choice(list(crops.keys()))
    c = crops[crop]

    row = {
        "N": np.random.uniform(*c["N"]),
        "P": np.random.uniform(*c["P"]),
        "K": np.random.uniform(*c["K"]),
        "pH": np.random.uniform(*c["pH"]),
        "temperature": np.random.uniform(*c["temp"]),
        "rainfall": np.random.uniform(*c["rain"]),
        "humidity": np.random.uniform(30, 90),
        "soil_type": random.choice(soil_types),
        "crop": crop
    }

    # Add noise (5–10% random variation)
    for key in ["N","P","K","pH","temperature","rainfall","humidity"]:
        row[key] *= random.uniform(0.95, 1.10)

    data.append(row)

df = pd.DataFrame(data)
df.to_csv("synthetic_crop_data_100k.csv", index=False)

print("Generated 100k dataset!")

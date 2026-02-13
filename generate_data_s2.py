import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_building_data(days=30):
    # Time range: 30 days, hourly resolution
    start_time = datetime(2025, 1, 1)
    timestamps = [start_time + timedelta(hours=i) for i in range(24 * days)]
    n = len(timestamps)

    # Base patterns
    hours = np.array([t.hour for t in timestamps])
    is_weekend = np.array([t.weekday() >= 5 for t in timestamps])

    # 1. Occupancy: High during 9-5 MF, Low weekends/night
    occupancy = np.zeros(n)
    # Work hours (9-17)
    work_mask = (hours >= 9) & (hours < 18) & (~is_weekend)
    occupancy[work_mask] = np.random.normal(loc=1200, scale=150, size=np.sum(work_mask))
    # Off hours
    off_mask = ~work_mask
    occupancy[off_mask] = np.random.normal(loc=50, scale=20, size=np.sum(off_mask))
    occupancy = np.clip(occupancy, 0, None).astype(int)

    # 2. Temperature (Outside): Sinusoidal day/night
    # Peak at 2 PM (14), Low at 2 AM (2)
    temp_base = 25 - 5 * np.cos((hours - 2) * 2 * np.pi / 24)
    temperature = temp_base + np.random.normal(0, 1, n)

    # 3. HVAC Status (1=On, 0=Off)
    # Logic: On if Occ > 100 OR Temp > 28
    hvac_status = ((occupancy > 100) | (temperature > 28)).astype(int)

    # 4. Energy Consumption (kWh)
    # Base load + HVAC + Lighting + Occupancy load
    base_load = 50 # Servers, standby
    hvac_load = hvac_status * 200
    lighting_load = np.where((occupancy > 20), 80, 10)
    # Add noise
    energy = base_load + hvac_load + lighting_load + (occupancy * 0.05)
    energy += np.random.normal(0, 5, n)

    data = {
        "Timestamp": timestamps,
        "Energy_Consumption_kWh": energy.round(2),
        "Temperature_C": temperature.round(1),
        "Humidity_Percent": np.random.uniform(40, 70, n).round(1),
        "Occupancy_Count": occupancy,
        "HVAC_Status": hvac_status,
        "Lighting_Status": (lighting_load > 20).astype(int)
    }

    df = pd.DataFrame(data)
    return df

if __name__ == "__main__":
    df = generate_building_data()
    output_path = "data/smart_building_energy.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} rows of building data at {output_path}")

import numpy as np
import pandas as pd

def calculate_derived_features(data: dict) -> dict:
    """
    Computes derived clinical features from raw patient inputs:
    - age_years (if age in days is provided)
    - bmi = weight / (height/100)^2
    - pulse_pressure = ap_hi - ap_lo
    - map_pressure = (ap_hi + 2 * ap_lo) / 3
    """
    age_years = float(data.get("age_years", 0))
    if age_years == 0 and "age" in data:
        age_years = round(float(data["age"]) / 365.25, 1)

    height = float(data["height"])
    weight = float(data["weight"])
    ap_hi = float(data["ap_hi"])
    ap_lo = float(data["ap_lo"])

    # Calculate BMI
    height_m = height / 100.0
    bmi = round(weight / (height_m ** 2), 2)

    # Calculate Pulse Pressure (Systolic - Diastolic)
    pulse_pressure = ap_hi - ap_lo

    # Calculate Mean Arterial Pressure (MAP)
    map_pressure = round(((2.0 * ap_lo) + ap_hi) / 3.0, 2)

    return {
        "age_years": age_years,
        "gender": int(data["gender"]),
        "height": height,
        "weight": weight,
        "ap_hi": ap_hi,
        "ap_lo": ap_lo,
        "cholesterol": int(data["cholesterol"]),
        "gluc": int(data["gluc"]),
        "smoke": int(data["smoke"]),
        "alco": int(data["alco"]),
        "active": int(data["active"]),
        "bmi": bmi,
        "pulse_pressure": pulse_pressure,
        "map_pressure": map_pressure
    }

def prepare_feature_array(data: dict, feature_order: list) -> pd.DataFrame:
    """
    Ensures input features are in the exact column order expected by the model.
    """
    processed = calculate_derived_features(data)
    df_features = pd.DataFrame([processed])[feature_order]
    return df_features

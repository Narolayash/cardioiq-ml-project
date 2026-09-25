def get_sample_patients() -> list:
    """Pre-configured sample patient profiles for instant UI testing."""
    return [
        {
            "id": "patient_1",
            "name": "Arjun Patel (Low Risk Sample)",
            "age_years": 32,
            "gender": 2, # Male
            "height": 175,
            "weight": 70.0,
            "ap_hi": 115,
            "ap_lo": 75,
            "cholesterol": 1,
            "gluc": 1,
            "smoke": 0,
            "alco": 0,
            "active": 1,
            "description": "Young, non-smoker, normal blood pressure and lipid profile."
        },
        {
            "id": "patient_2",
            "name": "Priya Sharma (Moderate Risk Sample)",
            "age_years": 50,
            "gender": 1, # Female
            "height": 158,
            "weight": 68.0,
            "ap_hi": 135,
            "ap_lo": 85,
            "cholesterol": 2,
            "gluc": 1,
            "smoke": 0,
            "alco": 0,
            "active": 1,
            "description": "Middle-aged, borderline pre-hypertension and above-normal cholesterol."
        },
        {
            "id": "patient_3",
            "name": "Ramesh Verma (High Risk Sample)",
            "age_years": 62,
            "gender": 2, # Male
            "height": 168,
            "weight": 92.0,
            "ap_hi": 160,
            "ap_lo": 100,
            "cholesterol": 3,
            "gluc": 2,
            "smoke": 1,
            "alco": 1,
            "active": 0,
            "description": "Senior, stage 2 hypertension, high cholesterol, active smoker, sedentary."
        }
    ]

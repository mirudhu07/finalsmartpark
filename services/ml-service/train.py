"""
SmartPark AI — Demand Forecasting Model Training & Evaluation Pipeline
Reproducible training and time-based holdout evaluation against baselines.
"""

import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error

MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_FILE = os.path.join(MODELS_DIR, "smartpark_occupancy_model.joblib")
METADATA_FILE = os.path.join(MODELS_DIR, "model_metadata.json")

def generate_synthetic_occupancy_data(days=30, facilities_count=4, random_seed=42):
    """
    Generates realistic parking occupancy time-series without fabricating live data.
    Clearly marked as synthetic demonstration dataset.
    """
    np.random.seed(random_seed)
    start_date = datetime(2026, 9, 1, 0, 0)
    records = []

    # Facilities with varying capacities
    facilities = [
        {"id": "fac_tech_center", "capacity": 500, "profile": "commercial"},
        {"id": "fac_downtown_plaza", "capacity": 850, "profile": "retail"},
        {"id": "fac_metro_station", "capacity": 1200, "profile": "transit"},
        {"id": "fac_harbor_garage", "capacity": 350, "profile": "evening"}
    ]

    time_steps = days * 24 * 4  # every 15 mins
    horizons = [15, 30, 45, 60]

    for step in range(time_steps):
        current_time = start_date + timedelta(minutes=step * 15)
        hour = current_time.hour
        minute = current_time.minute
        dow = current_time.weekday()
        is_weekend = 1 if dow >= 5 else 0

        for fac in facilities:
            profile = fac["profile"]
            
            # Diurnal base occupancy curve
            if profile == "commercial":
                # High 8am - 6pm on weekdays
                base = 0.15
                if not is_weekend:
                    if 8 <= hour < 10:
                        base = 0.40 + (hour - 8) * 0.35
                    elif 10 <= hour < 16:
                        base = 0.82 + np.sin(hour) * 0.05
                    elif 16 <= hour < 19:
                        base = 0.75 - (hour - 16) * 0.20
                    else:
                        base = 0.15
                else:
                    base = 0.20 + 0.10 * np.sin(hour / 3.0)
            elif profile == "retail":
                # High 11am - 9pm, especially weekends
                base = 0.20
                if 11 <= hour < 21:
                    base = 0.78 if is_weekend else 0.65
            elif profile == "transit":
                # Commuter surges 7-9am and 5-7pm weekdays
                base = 0.20
                if not is_weekend:
                    if 7 <= hour < 9:
                        base = 0.88
                    elif 9 <= hour < 17:
                        base = 0.92
                    elif 17 <= hour < 19:
                        base = 0.65
            else:
                # Evening entertainment
                base = 0.25
                if 17 <= hour < 23:
                    base = 0.85

            # Add stochastic noise and bounds
            noise = np.random.normal(0, 0.03)
            current_occ = float(np.clip(base + noise, 0.05, 0.98))

            # Future occupancy at horizons
            for h in horizons:
                future_time = current_time + timedelta(minutes=h)
                f_hour = future_time.hour
                # Small directional drift towards diurnal target
                target_drift = (0.75 - current_occ) * (h / 120.0) * (0.5 if not is_weekend else 0.2)
                future_noise = np.random.normal(0, 0.02 * (h / 15.0))
                future_occ = float(np.clip(current_occ + target_drift + future_noise, 0.02, 1.0))

                records.append({
                    "timestamp": current_time.isoformat(),
                    "facility_id": fac["id"],
                    "facility_capacity": fac["capacity"],
                    "hour": hour,
                    "minute": minute,
                    "day_of_week": dow,
                    "is_weekend": is_weekend,
                    "current_occupancy_ratio": current_occ,
                    "horizon_minutes": h,
                    "future_occupancy_ratio": future_occ
                })

    return pd.DataFrame(records)

def train_and_evaluate():
    print("==================================================")
    print(" SmartPark AI Demand Forecasting Model Pipeline   ")
    print("==================================================")

    print("1. Generating synthetic 30-day multi-facility training set...")
    df = generate_synthetic_occupancy_data(days=30, facilities_count=4)
    print(f"   Generated {len(df)} total time-series observation rows.")

    feature_cols = [
        "hour",
        "minute",
        "day_of_week",
        "is_weekend",
        "current_occupancy_ratio",
        "horizon_minutes",
        "facility_capacity"
    ]
    target_col = "future_occupancy_ratio"

    # Time-based holdout split (no future data leakage)
    split_index = int(len(df) * 0.80)
    train_df = df.iloc[:split_index]
    test_df = df.iloc[split_index:]

    X_train = train_df[feature_cols]
    y_train = train_df[target_col]
    X_test = test_df[feature_cols]
    y_test = test_df[target_col]

    print(f"2. Time-based holdout split: {len(X_train)} train rows, {len(X_test)} holdout test rows.")

    # Baseline 1: Naive persistence (future = current)
    baseline_naive_preds = test_df["current_occupancy_ratio"]
    naive_mae = mean_absolute_error(y_test, baseline_naive_preds)
    naive_rmse = np.sqrt(mean_squared_error(y_test, baseline_naive_preds))

    # Baseline 2: Time-of-day historical mean
    historical_means = train_df.groupby(["hour", "day_of_week", "horizon_minutes"])[target_col].mean().to_dict()
    mean_preds = test_df.apply(
        lambda r: historical_means.get((r["hour"], r["day_of_week"], r["horizon_minutes"]), 0.5),
        axis=1
    )
    mean_mae = mean_absolute_error(y_test, mean_preds)
    mean_rmse = np.sqrt(mean_squared_error(y_test, mean_preds))

    print("3. Training Gradient Boosting Forecaster...")
    model = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=5,
        subsample=0.85,
        random_state=42
    )
    model.fit(X_train, y_train)

    # Predictions on holdout test set
    test_preds = np.clip(model.predict(X_test), 0.0, 1.0)
    model_mae = mean_absolute_error(y_test, test_preds)
    model_rmse = np.sqrt(mean_squared_error(y_test, test_preds))

    print("\n---------------- Model Evaluation Results ----------------")
    print(f" Baseline 1 (Persistence) : MAE = {naive_mae*100:.2f}%, RMSE = {naive_rmse*100:.2f}%")
    print(f" Baseline 2 (Time Mean)   : MAE = {mean_mae*100:.2f}%, RMSE = {mean_rmse*100:.2f}%")
    print(f" SmartPark Forecaster GBR : MAE = {model_mae*100:.2f}%, RMSE = {model_rmse*100:.2f}%")
    print(f" MAE Improvement over Persistence : {((naive_mae - model_mae)/naive_mae)*100:.1f}%")
    print("----------------------------------------------------------\n")

    # Save model artifact
    print(f"4. Saving model artifact to {MODEL_FILE}...")
    joblib.dump(model, MODEL_FILE)

    metadata = {
        "model_name": "SmartPark Demand Forecaster (GBR)",
        "model_version": "v1.4.0",
        "architecture": "GradientBoostingRegressor(n_estimators=120, max_depth=5)",
        "trained_at": datetime.utcnow().isoformat() + "Z",
        "dataset_type": "synthetic_demonstration_dataset",
        "training_samples": len(X_train),
        "test_holdout_samples": len(X_test),
        "feature_columns": feature_cols,
        "evaluation_metrics": {
            "model_mae_percentage": round(float(model_mae * 100), 2),
            "model_rmse_percentage": round(float(model_rmse * 100), 2),
            "baseline_persistence_mae": round(float(naive_mae * 100), 2),
            "baseline_persistence_rmse": round(float(naive_rmse * 100), 2),
            "baseline_diurnal_mae": round(float(mean_mae * 100), 2),
            "relative_improvement_percentage": round(float(((naive_mae - model_mae)/naive_mae)*100), 1)
        },
        "supported_horizons_minutes": [15, 30, 45, 60]
    }

    with open(METADATA_FILE, "w") as f:
        json.dump(metadata, f, indent=2)

    print(f"5. Saved model metadata to {METADATA_FILE}.")
    print("Pipeline completed successfully.")

if __name__ == "__main__":
    train_and_evaluate()

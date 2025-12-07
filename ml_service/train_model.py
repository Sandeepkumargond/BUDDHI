
import pandas as pd
import numpy as np
import torch
import torch.nn as nn
import torch.optim as optim
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import joblib
import os
from model_def import StudentRiskModel

# Define constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_PATH = os.path.join(BASE_DIR, 'dataset', 'student_risk_data.csv')
MODEL_DIR = os.path.join(BASE_DIR, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'risk_model_v2.pth')
ENCODER_PATH = os.path.join(MODEL_DIR, 'encoders_v2.joblib')
TARGET_COLUMN = 'Risk_Category'

def train():
    print("Starting Deep Learning training pipeline...")
    
    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}. Please ensure the file exists.")
        return

    data = pd.read_csv(DATASET_PATH)
    
    # Preprocessing
    # Numeric
    numeric_features = ['CGPA', 'Attendance_Pct', 'Books_Issued'] # Columns from the viewed CSV
    # Verify columns exist
    for col in numeric_features:
        if col not in data.columns:
            # Fallback if CSV format is slightly different than viewed
            print(f"Warning: {col} not in dataset. Available: {data.columns}")
    
    # Categorical
    # 'Book_Genre_Preference', 'Fees_Status'
    categorical_features = ['Book_Genre_Preference', 'Fees_Status']
    
    # Drop irrelevant
    # 'Enrollment_ID', 'Semester' (Maybe logic depends on semester, but keeping it simple as per original), 'Risk_Category'
    
    X = data[numeric_features + categorical_features]
    y = data[TARGET_COLUMN]
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Scaling Numerics
    scaler = StandardScaler()
    X_train_num = scaler.fit_transform(X_train[numeric_features])
    X_test_num = scaler.transform(X_test[numeric_features])
    
    # Encoding Categoricals
    label_encoders = {}
    X_train_cat = []
    X_test_cat = []
    categorical_cardinalities = []
    
    for cat in categorical_features:
        le = LabelEncoder()
        # Handle unknown categories in future? For now, fit on full data or handle exception. 
        # Standard approach: fit on train, handle unknowns by mapping to a special 'unknown' token or just mode?
        # Simple for broken-down task: Fit on concatenation to ensure all known classes are covered for this demo.
        # Ideally: Fit on Train, handle unknown in storage.
        le.fit(pd.concat([X_train[cat], X_test[cat]], axis=0)) 
        
        X_train_cat.append(le.transform(X_train[cat]))
        X_test_cat.append(le.transform(X_test[cat]))
        
        label_encoders[cat] = le
        categorical_cardinalities.append(len(le.classes_))
        
    X_train_cat = np.stack(X_train_cat, axis=1) # (batch, num_cats)
    X_test_cat = np.stack(X_test_cat, axis=1)
    
    # Target Encoding
    target_le = LabelEncoder()
    y_train_enc = target_le.fit_transform(y_train)
    y_test_enc = target_le.transform(y_test)
    
    # Initialize Model
    model = StudentRiskModel(
        num_numerical_features=len(numeric_features),
        categorical_cardinalities=categorical_cardinalities,
        embedding_dim=16,
        num_heads=4,
        hidden_dim=32
    )
    
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # Tensors
    X_train_num_t = torch.FloatTensor(X_train_num)
    X_train_cat_t = torch.LongTensor(X_train_cat)
    y_train_t = torch.LongTensor(y_train_enc)
    
    X_test_num_t = torch.FloatTensor(X_test_num)
    X_test_cat_t = torch.LongTensor(X_test_cat)
    y_test_t = torch.LongTensor(y_test_enc)
    
    # Training Loop
    epochs = 50
    batch_size = 16
    
    train_dataset = torch.utils.data.TensorDataset(X_train_num_t, X_train_cat_t, y_train_t)
    train_loader = torch.utils.data.DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    
    model.train()
    for epoch in range(epochs):
        running_loss = 0.0
        for b_num, b_cat, b_y in train_loader:
            optimizer.zero_grad()
            outputs = model(b_num, b_cat)
            loss = criterion(outputs, b_y)
            loss.backward()
            optimizer.step()
            running_loss += loss.item()
        
        if (epoch+1) % 10 == 0:
            print(f"Epoch {epoch+1}/{epochs}, Loss: {running_loss/len(train_loader):.4f}")
            
    # Evaluation
    model.eval()
    with torch.no_grad():
        outputs = model(X_test_num_t, X_test_cat_t)
        _, predicted = torch.max(outputs, 1)
        accuracy = (predicted == y_test_t).sum().item() / len(y_test_t)
        print(f"Test Accuracy: {accuracy:.4f}")

    # Save
    os.makedirs(MODEL_DIR, exist_ok=True)
    torch.save(model.state_dict(), MODEL_PATH)
    
    # Save Metadata (Scalers and Encoders)
    metadata = {
        'scaler': scaler,
        'label_encoders': label_encoders,
        'target_encoder': target_le,
        'numeric_features': numeric_features,
        'categorical_features': categorical_features,
        'model_architecture_params': {
            'num_numerical_features': len(numeric_features),
            'categorical_cardinalities': categorical_cardinalities,
            'embedding_dim': 16,
            'num_heads': 4,
            'hidden_dim': 32
        }
    }
    joblib.dump(metadata, ENCODER_PATH)
    print(f"Model saved to {MODEL_PATH}")
    print(f"Metadata saved to {ENCODER_PATH}")

if __name__ == "__main__":
    train()

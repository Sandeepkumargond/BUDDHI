
import os
import joblib
import pandas as pd
import uvicorn
import torch
import numpy as np
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from model_def import StudentRiskModel

# Load environment variables
load_dotenv()

PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")

app = FastAPI(title="ML Microservice", description="Dropout Prediction (PyTorch) & AI Counselor")

# Initialize Perplexity Client
client = OpenAI(api_key=PERPLEXITY_API_KEY, base_url="https://api.perplexity.ai")

# Load Model and Metadata
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, 'models')
MODEL_PATH = os.path.join(MODEL_DIR, 'risk_model_v2.pth')
ENCODER_PATH = os.path.join(MODEL_DIR, 'encoders_v2.joblib')

model = None
metadata = None

try:
    if os.path.exists(MODEL_PATH) and os.path.exists(ENCODER_PATH):
        # Load Metadata
        metadata = joblib.load(ENCODER_PATH)
        arch_params = metadata['model_architecture_params']
        
        # Load PyTorch Model
        model = StudentRiskModel(**arch_params)
        model.load_state_dict(torch.load(MODEL_PATH))
        model.eval()
        print(" Deep Learning Risk model loaded successfully.")
    else:
        print("Warning: Risk model files not found. /predict_risk will fail until trained.")
except Exception as e:
    print(f"Error loading model: {e}")

# Data Models

from typing import List

# Data Models
class StudentData(BaseModel):
    CGPA: float
    Attendance_Pct: int
    Books_Issued: int
    Book_Genre_Preference: str
    Fees_Status: str
    Enrollment_ID: str = "Unknown"

class ChatRequest(BaseModel):
    query: str
    student_context: dict

class RiskResponse(BaseModel):
    Enrollment_ID: str
    risk_level: str
    is_at_risk: bool

class ChatResponse(BaseModel):
    response: str

@app.post("/predict_risk", response_model=List[RiskResponse])
def predict_risk(students: List[StudentData]):
    if not model or not metadata:
        raise HTTPException(status_code=503, detail="Model not loaded. Please run train_model.py first.")
    
    # Batch Processing
    # For now, iterating. Can be optimized to batch tensors if throughput is critical.
    
    response_list = []
    
    # Tensors lists
    all_num_features = []
    all_cat_features = []
    
    # Pre-process batch
    for student in students:
        # Numerical
        num_features = [student.CGPA, student.Attendance_Pct, student.Books_Issued]
        all_num_features.append(num_features)
        
        # Categorical
        # ORDER MUST MATCH 'categorical_features' in metadata
        # Removed 'Survey_Drop_Thought'
        cat_features_input = [student.Book_Genre_Preference, student.Fees_Status]
        
        student_cat_encoded = []
        for i, cat_val in enumerate(cat_features_input):
            cat_name = metadata['categorical_features'][i]
            le = metadata['label_encoders'][cat_name]
            
            try:
                encoded = le.transform([cat_val])[0]
            except ValueError:
                encoded = 0
            student_cat_encoded.append(encoded)
        all_cat_features.append(student_cat_encoded)
        
    try:
        # Vectorized Prediction
        if not all_num_features:
             return []
             
        # Scale Numerical
        scaler = metadata['scaler']
        num_scaled = scaler.transform(all_num_features)
        x_num_t = torch.FloatTensor(num_scaled)
        
        # Categorical Tensor
        x_cat_t = torch.LongTensor(all_cat_features)
        
        # Predict
        with torch.no_grad():
            outputs = model(x_num_t, x_cat_t)
            _, predicted_indices = torch.max(outputs, 1)
            
        target_le = metadata['target_encoder']
        prediction_labels = target_le.inverse_transform(predicted_indices.numpy())
        
        # Construct Response
        for i, student in enumerate(students):
            prediction_label = prediction_labels[i]
            is_at_risk = prediction_label in ['critical', 'on_the_verge_of_drop']
            
            response_list.append({
                "Enrollment_ID": student.Enrollment_ID,
                "risk_level": prediction_label,
                "is_at_risk": is_at_risk
            })
            
        return response_list
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    student_data = request.student_context
    
    # System Prompt Injection
    SYSTEM_PROMPT = f"""
You are an expert Academic AI Counselor for a college ERP system.
Your goal is to assist the student based on their real-time academic records.

**Current Student Data:**
- ID: {student_data.get('Enrollment_ID', 'Unknown')}
- CGPA: {student_data.get('CGPA')}
- Risk Status: {student_data.get('risk_label')}
- Fees Status: {student_data.get('Fees_Status')}

**Instructions:**
1. **Context Awareness:** If the student's risk status is 'critical' or 'on_the_verge_of_drop', be empathetic but firm about the need to improve.
2. **Fees:** If 'Fees_Status' is pending, gently remind them that this might affect their exam eligibility.
3. **Tone:** Professional, encouraging, and data-driven.
4. **Knowledge Base:** You have access to general academic knowledge.

Answer the student's query below keeping this context in mind.
"""

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": request.query}
    ]

    try:
        response = client.chat.completions.create(
            model="sonar-pro",
            messages=messages,
        )
        ai_reply = response.choices[0].message.content
        return {"response": ai_reply}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Perplexity API Error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

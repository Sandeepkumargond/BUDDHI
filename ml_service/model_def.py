
import torch
import torch.nn as nn
import torch.nn.functional as F

class StudentRiskModel(nn.Module):
    def __init__(self, num_numerical_features, categorical_cardinalities, embedding_dim=16, num_heads=4, hidden_dim=64):
        super(StudentRiskModel, self).__init__()
        
        # Embeddings for categorical features
        # categorical_cardinalities is a list of tuples: (num_categories_for_feat_i)
        self.embeddings = nn.ModuleList([
            nn.Embedding(num_cats, embedding_dim) for num_cats in categorical_cardinalities
        ])
        
        # Linear projection for numerical features to match embedding_dim
        self.num_proj = nn.Linear(num_numerical_features, embedding_dim)
        
        # Input dimension for transformer is embedding_dim
        # We will treat each categorical feature and the numerical vector as separate tokens
        # Total tokens = len(categorical_features) + 1 (for numerical)
        
        # Transformer Layer (Multi-Head Attention)
        # batch_first=True -> (batch, seq, feature)
        encoder_layer = nn.TransformerEncoderLayer(d_model=embedding_dim, nhead=num_heads, dim_feedforward=hidden_dim, batch_first=True)
        self.transformer_encoder = nn.TransformerEncoder(encoder_layer, num_layers=2)
        
        # Final Classifier
        # Flatten: (num_cats + 1) * embedding_dim
        input_dim_final = (len(categorical_cardinalities) + 1) * embedding_dim
        self.fc1 = nn.Linear(input_dim_final, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, 3) # 3 Classes: no_risk, on_the_verge, critical

    def forward(self, x_num, x_cat):
        # x_num: (batch, num_numerical_features)
        # x_cat: (batch, num_categorical_features) - LongTensor
        
        batch_size = x_num.size(0)
        
        # 1. Process Categorical
        # List of (batch, embedding_dim)
        embedded_cats = [emb(x_cat[:, i]) for i, emb in enumerate(self.embeddings)]
        # Stack -> (batch, num_cats, embedding_dim)
        cat_tokens = torch.stack(embedded_cats, dim=1)
        
        # 2. Process Numerical
        # Project to embedding_dim -> (batch, embedding_dim)
        num_token = self.num_proj(x_num)
        # Reshape to (batch, 1, embedding_dim)
        num_token = num_token.unsqueeze(1)
        
        # 3. Concatenate tokens -> (batch, num_cats + 1, embedding_dim)
        tokens = torch.cat([cat_tokens, num_token], dim=1)
        
        # 4. Transformer Interaction
        # (batch, seq_len, embedding_dim)
        attn_output = self.transformer_encoder(tokens)
        
        # 5. Flatten and Classify
        flattened = attn_output.view(batch_size, -1)
        
        x = self.fc1(flattened)
        x = self.relu(x)
        logits = self.fc2(x)
        
        return logits

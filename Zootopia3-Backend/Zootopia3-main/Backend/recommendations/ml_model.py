from surprise import Dataset, Reader, SVD
from surprise.model_selection import train_test_split
import pandas as pd

model = None

def train_model(data: list):
    global model
    
    if not data:
        return False
    
    df = pd.DataFrame(data)
    
    reader = Reader(rating_scale=(1, 10))
    dataset = Dataset.load_from_df(
        df[["client_id", "product_id", "rating"]],
        reader
    )
    
    trainset, _ = train_test_split(dataset, test_size=0.2)
    
    model = SVD()
    model.fit(trainset)
    return True

def get_recommendations(client_id: int, product_ids: list, top_n: int = 5):
    global model
    
    if model is None:
        return []
    
    predictions = []
    for product_id in product_ids:
        pred = model.predict(client_id, product_id)
        predictions.append({
            "product_id": product_id,
            "score": pred.est
        })
    
    predictions.sort(key=lambda x: x["score"], reverse=True)
    return predictions[:top_n]
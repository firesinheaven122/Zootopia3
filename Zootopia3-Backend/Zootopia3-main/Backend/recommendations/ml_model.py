model = None
ml_import_error = None

try:
    from surprise import Dataset, Reader, SVD
    from surprise.model_selection import train_test_split
except (ModuleNotFoundError, ImportError) as exc:
    ml_import_error = exc

def train_model(data: list):
    global model
    if ml_import_error is not None:
        return False

    if not data:
        return False

    try:
        import pandas as pd
    except (ModuleNotFoundError, ImportError):
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

def get_recommendations(client_id: int, product_ids: list, pet=None, top_n: int = 5):
    global model

    predictions = []
    for product_id in product_ids:
        if model:
            pred = model.predict(client_id, product_id)
            score = pred.est
        else:
            score = 5.0

        if pet:
            score = adjust_score_by_pet(score, product_id, pet)

        predictions.append({
            "product_id": product_id,
            "score": score
        })

    predictions.sort(key=lambda x: x["score"], reverse=True)
    return predictions[:top_n]

def adjust_score_by_pet(score: float, product_id: int, pet) -> float:
    if pet.weight:
        weight = float(pet.weight)
        if weight > 25:
            score += 0.5
        elif weight < 5:
            score += 0.3

    if pet.body_girth:
        girth = float(pet.body_girth)
        if girth > 60:
            score += 0.4
        elif girth < 30:
            score += 0.2

    if pet.back_length:
        length = float(pet.back_length)
        if length > 50:
            score += 0.3

    return min(score, 10.0)
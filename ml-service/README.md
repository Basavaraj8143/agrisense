# ml-service

Python ML microservice for crop and pest inference.

## Endpoints
- `GET /ml/health`
- `POST /ml/recommend`
- `POST /ml/pest-detect`

## Local Run
```bash
pip install -r requirements.txt
python app.py
```

The service starts on `http://localhost:5000` by default.

## Request Notes
- `POST /ml/recommend` expects JSON aligned with the Node crop payload.
- `POST /ml/pest-detect` accepts either:
  - `multipart/form-data` with `image`
  - JSON with `image_base64`

## Providers
- Crop recommendation uses the bundled `crop_recommender.pkl` model plus local cleaned region data.
- Pest detection defaults to `PEST_PROVIDER=mock` so the service can run without external credentials.
- Set `PEST_PROVIDER=kindwise` and `PEST_PROVIDER_API_KEY` to use the external pest provider.

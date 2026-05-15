# Day 07 Log

## Completed
- Created a standalone `ml-service` Flask application with explicit microservice endpoints:
  - `GET /ml/health`
  - `POST /ml/recommend`
  - `POST /ml/pest-detect`
- Moved crop recommendation logic into `ml-service` and pointed it at local copied model/data assets
- Added normalized request validation and structured error responses for crop inference requests
- Added pest detection service abstraction with mock and Kindwise provider support
- Added environment-based configuration, service README updates, and a dedicated ML service contract doc

## Files Added/Updated
- `ml-service/app.py`
- `ml-service/services/crop_service.py`
- `ml-service/services/pest_service.py`
- `ml-service/services/__init__.py`
- `ml-service/utils/http.py`
- `ml-service/utils/validation.py`
- `ml-service/utils/__init__.py`
- `ml-service/requirements.txt`
- `ml-service/.env.example`
- `ml-service/README.md`
- `ml-service/model/crop_recommender.pkl`
- `ml-service/data/soil_averages.csv`
- `ml-service/data/cleaned/crop_cleaned.csv`
- `ml-service/data/cleaned/region_cleaned.csv`
- `shared-docs/ml-service-contract.md`

## Verification Completed
- Python syntax compilation passed for `ml-service` source files
- Flask test-client smoke checks passed for:
  - `GET /ml/health`
  - `POST /ml/recommend`
  - `POST /ml/pest-detect`

## Notes
- The crop model file is copied from the legacy Python backend so `ml-service` can run independently
- `PEST_PROVIDER=mock` remains the default for predictable Day 7 local testing
- The saved crop model emits scikit-learn version warnings on load in the current Python environment, but the service still runs

## Ready for Day 8
- Update Node crop and pest services to call `ml-service` over HTTP
- Add request timeout handling, correlation IDs, and graceful fallback responses in `backend-node`

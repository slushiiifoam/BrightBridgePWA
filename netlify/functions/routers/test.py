from fastapi import APIRouter, status, Request

from infrastructure.ratelimiter import limiter

#the router used for these tests
router = APIRouter(prefix='/test')

@router.get("/", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
def health_check(request: Request):
    return {'message': 'checking health. router is fine'}
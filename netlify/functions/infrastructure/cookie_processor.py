from fastapi import Request, HTTPException, status, Response

# 1. Define the auth dependency function
async def verify_auth_cookie(request: Request, response: Response):
    jwt_token = request.cookies.get("access_token")
    uuid_token = request.cookies.get("refresponseh_token")

    auth_service = request.app.state.auth_service

    user_uuid = auth_service.is_valid_jwt(jwt_token)

    if jwt_token and user_uuid:
        request.state.uuid = user_uuid
        return

    if not uuid_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized. Please authenticate"
        )

    regenerated_jwt = auth_service.refresh_jwt(uuid_token)
    if not regenerated_jwt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized. Please authenticate"
        )

    user_uuid = auth_service.is_valid_jwt(regenerated_jwt)
    request.state.uuid = user_uuid

    user_cookie_uuid = auth_service.refresh_uuid(uuid_token)
        
    response.set_cookie(
        key="refresponseh_token",
        value=user_cookie_uuid,
        samesite="Strict",
        secure=True,
        httponly=True,
        max_age=604800)

    # Directly set the cookie on the response object injected by FastAPI
    response.set_cookie(
        key="access_token",
        value=regenerated_jwt,
        max_age=1000,
        httponly=True,
        samesite="strict",
        secure=True,
    )
from fastapi import Request, HTTPException, status, Response

# 1. Define the auth dependency function
async def verify_auth_cookie(request: Request, response: Response):
    jwt_token = request.cookies.get("jwt")
    uuid_token = request.cookies.get("uuid")

    jwt_manager = request.app.state.jwt_manager

    if jwt_token and jwt_manager.is_valid_jwt(jwt_token):
        request.state.user = jwt_manager.decode(jwt_token)
        return

    if not uuid_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized. Please authenticate"
        )

    regenerated_jwt = await jwt_manager.regenerate_jwt_from_uuid(uuid_token)
    if not regenerated_jwt:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authorized. Please authenticate"
        )

    user = jwt_manager.decode(regenerated_jwt)
    request.state.user = user

    # Directly set the cookie on the response object injected by FastAPI
    response.set_cookie(
        key="jwt",
        value=regenerated_jwt,
        max_age=1000,
        httponly=True,
        samesite="strict",
        secure=True,
    )
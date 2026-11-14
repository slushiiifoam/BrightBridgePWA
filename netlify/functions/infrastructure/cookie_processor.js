/**
 * Middleware for verifying authentication cookies for protected routes.
 * Checks access_token first; if invalid/expired, attempts to refresh using refresh_token (uuid).
 * On successful refresh, sets new cookies on the response and attaches `req.uuid`.
 */
export const verifyAuthCookie = async (req, res, next) => {
  try {
    // Read cookies (requires `cookie-parser` middleware attached to Express app)
    // Corrected typos from Python code ("refresponseh_token" -> "refresh_token")
    const jwtToken = req.cookies?.access_token;
    const uuidToken = req.cookies?.refresh_token;

    // Retrieve authService attached to express app instance (req.app.locals)
    const authService = req.app.locals.authService;

    // Verify current access token
    let userUuid = jwtToken ? await authService.isValidJwt(jwtToken) : null;

    if (jwtToken && userUuid) {
      // Equivalent to request.state.uuid = user_uuid
      req.uuid = userUuid;
      return next();
    }

    if (!uuidToken) {
      return res.status(401).json({
        detail: 'User not authorized. Please authenticate',
      });
    }

    // Attempt JWT regeneration using refresh token
    const regeneratedJwt = await authService.refreshJwt(uuidToken);
    if (!regeneratedJwt) {
      return res.status(401).json({
        detail: 'User not authorized. Please authenticate',
      });
    }

    userUuid = await authService.isValidJwt(regeneratedJwt);
    req.uuid = userUuid;

    const userCookieUuid = await authService.refreshUuid(uuidToken);

    // Cookie configuration options
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    };

    // Set updated refresh_token cookie (7 days = 604800000 ms)
    res.cookie('refresh_token', userCookieUuid, {
      ...cookieOptions,
      maxAge: 604800 * 1000, // Express maxAge is in milliseconds
    });

    // Set updated access_token cookie (1000 seconds = 1000000 ms)
    res.cookie('access_token', regeneratedJwt, {
      ...cookieOptions,
      maxAge: 1000 * 1000,
    });

    return next();
  } catch (error) {
      return res.status(500).json({ detail: error.message || 'Internal Server Error' });
  }
};
import limiter from './ratelimiter.js'
import cookieParser from 'cookie-parser';
import helmet from 'helmet'

function setup_helmet(app){
    app.disable('x-powered-by');

    // 2. Apply security headers across all responses
    app.use(
    helmet({
        // Sends X-Content-Type-Options: nosniff
        noSniff: true,

        // Sends X-Frame-Options: DENY
        frameguard: { action: 'deny' },

        // Sends Content-Security-Policy: default-src 'none'; frame-ancestors 'none'
        contentSecurityPolicy: {
        useDefaults: false,
        directives: {
            defaultSrc: ["'none'"],
            frameAncestors: ["'none'"],
        },
        },
    })
    );

    // 3. Enforce strict JSON Content-Type headers on API responses & mutating requests
    app.use((req, res, next) => {
        const contentLength = Number(req.headers['content-length'] || 0);

        // Reject POST/PUT/PATCH requests that send a body without application/json
        const hasBody = ['POST', 'PUT', 'PATCH'].includes(req.method) && (contentLength > 0 || Boolean(req.headers['transfer-encoding']));
        if (hasBody && !req.is('application/json')) {
            return res.status(415).json({
            success: false,
            detail: 'Unsupported Media Type: Content-Type must be application/json',
            });
        }

        // Default response Content-Type to application/json if not explicitly set
        res.type('application/json');
        next();
    });
}

function setup_infrastructure(app){
    setup_helmet(app);
    app.use(limiter);
    app.use(cookieParser());
};

export default setup_infrastructure;
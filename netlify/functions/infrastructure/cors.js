import cors from 'cors';

const ALLOWED_ORIGINS = [
  'https://bright-bridge-pwa.netlify.app', 'https://backend-express--bright-bridge-pwa.netlify.app',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:8888'] : []),
];

export function setup_cors(app){
    app.use(
        cors({
            origin: (origin, callback) => {
            // Allow requests with no Origin header (e.g., server-to-server, curl, mobile apps)
            if (!origin || ALLOWED_ORIGINS.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
            },
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        })
    );
};

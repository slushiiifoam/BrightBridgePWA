export function setup_error_handling(app) {
    app.use((err, req, res, next) => {
    console.error('[API Error]:', err); // Logged privately to Netlify Function Logs

    if (err?.name === 'ZodError') {
        return res.status(400).json({
        success: false,
        detail: 'Invalid request payload',
        issues: err.issues,
        });
    }

    const status = err?.statusCode || 500;
    return res.status(status).json({
        success: false,
        detail: status < 500 ? err.message : 'Internal server error',
    });
    });
};
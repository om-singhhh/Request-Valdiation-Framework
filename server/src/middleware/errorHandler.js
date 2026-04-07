/**
 * Central error handler — keeps responses consistent and user-friendly.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500;
  const message =
    status === 500 ? 'Something went wrong on the server. Please try again later.' : err.message;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    ok: false,
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
    },
  });
}

import { loadValidationForRoute } from '../services/loadValidation.js';

const JOI_OPTIONS = {
  abortEarly: false,
  stripUnknown: true,
  /**
   * Coerce query/body primitives: "123" → 123, "true" → true, etc.
   */
  convert: true,
};

/**
 * Shapes Joi validation output into a stable API contract for the frontend.
 */
function formatJoiError(error) {
  if (!error || !error.details) {
    return {
      message: 'Validation failed',
      fields: [],
      details: [],
    };
  }

  const details = error.details.map((d) => ({
    path: d.path.join('.') || '(root)',
    message: d.message.replace(/"/g, ''),
    type: d.type,
  }));

  const fields = details.reduce((acc, d) => {
    const existing = acc.find((x) => x.path === d.path);
    if (existing) {
      if (!existing.messages.includes(d.message)) existing.messages.push(d.message);
    } else {
      acc.push({ path: d.path, messages: [d.message], type: d.type });
    }
    return acc;
  }, []);

  return {
    message: 'Request validation failed',
    fields,
    details,
  };
}

/**
 * Express middleware factory: validates `req.body` using MongoDB-backed Joi schema.
 * @param {string} routeKey - Must match RequestValidationSchema.routeKey
 */
export function dynamicValidate(routeKey) {
  return async function dynamicValidateMiddleware(req, res, next) {
    try {
      const loaded = await loadValidationForRoute(routeKey);

      if (!loaded) {
        return res.status(500).json({
          ok: false,
          error: {
            code: 'VALIDATION_CONFIG_MISSING',
            message: `No active validation schema found for "${routeKey}".`,
          },
        });
      }

      const { error, value } = loaded.joiSchema.validate(req.body, JOI_OPTIONS);

      if (error) {
        const formatted = formatJoiError(error);
        return res.status(400).json({
          ok: false,
          error: {
            code: 'VALIDATION_FAILED',
            ...formatted,
          },
        });
      }

      req.validatedBody = value;
      next();
    } catch (err) {
      next(err);
    }
  };
}

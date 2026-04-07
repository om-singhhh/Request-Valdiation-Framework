/**
 * Lightweight in-memory cache for compiled Joi schemas + docs.
 * Cleared when seed or admin updates run (optional TTL in future).
 */
const cache = new Map();

export function getCached(routeKey) {
  return cache.get(routeKey);
}

export function setCached(routeKey, { joiSchema, doc }) {
  cache.set(routeKey, { joiSchema, doc });
}

export function invalidateRoute(routeKey) {
  cache.delete(routeKey);
}

export function clearCache() {
  cache.clear();
}

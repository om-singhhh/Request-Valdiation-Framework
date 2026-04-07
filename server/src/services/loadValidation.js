import { RequestValidationSchema } from '../models/RequestValidationSchema.js';
import { buildJoiSchemaFromDoc } from './joiFromDoc.js';
import { getCached, setCached } from './schemaCache.js';

/**
 * Loads validation doc from MongoDB (or cache) and returns Joi schema + raw doc.
 */
export async function loadValidationForRoute(routeKey) {
  const hit = getCached(routeKey);
  if (hit) return hit;

  const doc = await RequestValidationSchema.findOne({
    routeKey,
    isActive: true,
  }).lean();

  if (!doc) return null;

  const joiSchema = buildJoiSchemaFromDoc(doc);
  const payload = { joiSchema, doc };
  setCached(routeKey, payload);
  return payload;
}

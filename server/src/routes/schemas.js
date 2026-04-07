import { Router } from 'express';
import { RequestValidationSchema } from '../models/RequestValidationSchema.js';

const router = Router();

/**
 * Public: list active validation definitions (drives dynamic forms in the UI).
 */
router.get('/', async (_req, res, next) => {
  try {
    const items = await RequestValidationSchema.find({ isActive: true })
      .sort({ routeKey: 1 })
      .select(
        'routeKey displayName description httpMethod fields.name fields.type fields.required fields.rules fields.messages createdAt updatedAt'
      )
      .lean();

    const normalized = items.map((doc) => ({
      ...doc,
      fields: doc.fields.map((f) => ({
        ...f,
        messages: f.messages || {},
      })),
    }));

    res.json({ ok: true, data: normalized });
  } catch (e) {
    next(e);
  }
});

/**
 * Public: single schema by routeKey (register | login | ...).
 */
router.get('/:routeKey', async (req, res, next) => {
  try {
    const key = String(req.params.routeKey).toLowerCase();
    const doc = await RequestValidationSchema.findOne({
      routeKey: key,
      isActive: true,
    }).lean();

    if (!doc) {
      return res.status(404).json({
        ok: false,
        error: { code: 'NOT_FOUND', message: `Unknown schema "${key}"` },
      });
    }

    res.json({
      ok: true,
      data: {
        ...doc,
        fields: doc.fields.map((f) => ({
          ...f,
          messages: f.messages || {},
        })),
      },
    });
  } catch (e) {
    next(e);
  }
});

export default router;

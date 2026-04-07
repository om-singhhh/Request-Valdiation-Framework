import { Router } from 'express';
import { dynamicValidate } from '../middleware/dynamicValidate.js';

const router = Router();

/**
 * Sample validated registration endpoint.
 * Rules come from MongoDB (routeKey: register); validated payload on req.validatedBody.
 */
router.post('/register', dynamicValidate('register'), (req, res) => {
  const body = req.validatedBody;
  res.status(201).json({
    ok: true,
    message: 'Registration payload accepted (sample; no user persistence).',
    data: {
      email: body.email,
      fullName: body.fullName,
      age: body.age,
    },
  });
});

/**
 * Sample validated login endpoint (routeKey: login).
 */
router.post('/login', dynamicValidate('login'), (req, res) => {
  const body = req.validatedBody;
  res.json({
    ok: true,
    message: 'Login payload accepted (sample; no real authentication).',
    data: {
      email: body.email,
      rememberMe: Boolean(body.rememberMe),
    },
  });
});

export default router;

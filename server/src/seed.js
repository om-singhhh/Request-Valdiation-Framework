import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDb } from './config/db.js';
import { RequestValidationSchema } from './models/RequestValidationSchema.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/request-validation-framework';

/**
 * Sample MongoDB documents for `/register` and `/login`.
 * Run: `npm run seed` from the server directory (with MongoDB running).
 */
const samples = [
  {
    routeKey: 'register',
    displayName: 'REGISTER',
    description: 'Create an account — email, identity, and age with dynamic rules from the database.',
    httpMethod: 'POST',
    isActive: true,
    fields: [
      {
        name: 'email',
        type: 'string',
        required: true,
        rules: { format: 'email', min: 5, max: 120 },
        messages: {
          required: 'We need your email to create an account.',
          stringMin: 'Email looks too short.',
          stringMax: 'Email is too long.',
          stringEmail: 'Please enter a valid email address.',
        },
      },
      {
        name: 'fullName',
        type: 'string',
        required: true,
        rules: { min: 2, max: 80, pattern: '^[A-Za-zÀ-ÿ\\s]+$' },
        messages: {
          required: 'Please tell us your name.',
          stringMin: 'Name should be at least 2 characters.',
          stringMax: 'Name is too long.',
          stringPattern: 'Use letters and spaces only.',
        },
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        rules: { min: 8, max: 128, pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+$' },
        messages: {
          required: 'Password is required.',
          stringMin: 'Password must be at least 8 characters.',
          stringMax: 'Password is too long.',
          stringPattern: 'Include upper, lower, and a number.',
        },
      },
      {
        name: 'age',
        type: 'number',
        required: true,
        rules: { min: 13, max: 120 },
        messages: {
          required: 'Age is required.',
          numberMin: 'You must be at least 13.',
          numberMax: 'Please enter a realistic age.',
        },
      },
    ],
  },
  {
    routeKey: 'login',
    displayName: 'LOGIN',
    description: 'Sign in — credentials plus optional remember-me flag.',
    httpMethod: 'POST',
    isActive: true,
    fields: [
      {
        name: 'email',
        type: 'string',
        required: true,
        rules: { format: 'email', min: 5, max: 120 },
        messages: {
          required: 'Email is required to sign in.',
          stringEmail: 'That does not look like an email.',
        },
      },
      {
        name: 'password',
        type: 'string',
        required: true,
        rules: { min: 8, max: 128 },
        messages: {
          required: 'Password is required.',
          stringMin: 'Password is too short.',
        },
      },
      {
        name: 'rememberMe',
        type: 'boolean',
        required: false,
        rules: {},
        messages: {},
      },
    ],
  },
];

async function seed() {
  await connectDb(MONGODB_URI);
  for (const doc of samples) {
    await RequestValidationSchema.findOneAndUpdate(
      { routeKey: doc.routeKey },
      { $set: doc },
      { upsert: true, new: true }
    );
  }
  // eslint-disable-next-line no-console
  console.log(`Seeded ${samples.length} validation schemas: ${samples.map((s) => s.routeKey).join(', ')}`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

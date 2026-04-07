import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDb } from './config/db.js';
import schemasRouter from './routes/schemas.js';
import authSamplesRouter from './routes/authSamples.js';
import { errorHandler } from './middleware/errorHandler.js';

const PORT = Number(process.env.PORT) || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/request-validation-framework';

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : ['http://localhost:5173', 'http://127.0.0.1:5173'];

const app = express();

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));

app.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'request-validation-framework-api' });
});

app.use('/api/schemas', schemasRouter);
app.use('/', authSamplesRouter);

app.use(errorHandler);

async function main() {
  await connectDb(MONGODB_URI);
  // eslint-disable-next-line no-console
  console.log(`MongoDB connected`);
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server', err);
  process.exit(1);
});

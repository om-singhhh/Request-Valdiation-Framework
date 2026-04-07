import mongoose from 'mongoose';

/**
 * Rule keys supported by the Joi builder (see services/joiFromDoc.js).
 * Stored as plain objects for flexibility.
 */
const FieldRuleSchema = new mongoose.Schema(
  {
    min: mongoose.Schema.Types.Mixed,
    max: mongoose.Schema.Types.Mixed,
    pattern: String,
    /** Built-in Joi helpers: "email", "uri", "uuid" */
    format: String,
    /** Allowed values for string enums */
    allowed: [mongoose.Schema.Types.Mixed],
    /** Strip unknown keys at object level (future) */
    stripUnknown: Boolean,
  },
  { _id: false }
);

const FieldDefinitionSchema = new mongoose.Schema(
  {
    /** JSON body key */
    name: { type: String, required: true, trim: true },
    /** Logical type used to pick Joi schema */
    type: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean'],
    },
    required: { type: Boolean, default: false },
    rules: { type: FieldRuleSchema, default: {} },
    /** Custom Joi message overrides keyed by rule name */
    messages: {
      type: Map,
      of: String,
      default: {},
    },
  },
  { _id: false }
);

/**
 * One document = validation definition for a single route key (e.g. "register").
 */
const RequestValidationSchemaDoc = new mongoose.Schema(
  {
    /** Unique key used by middleware: "register", "login", ... */
    routeKey: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    displayName: { type: String, trim: true },
    description: { type: String, trim: true, default: '' },
    httpMethod: {
      type: String,
      default: 'POST',
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    },
    fields: {
      type: [FieldDefinitionSchema],
      validate: [(v) => Array.isArray(v) && v.length > 0, 'At least one field'],
    },
    /** Soft-disable without deleting */
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const RequestValidationSchema = mongoose.model(
  'RequestValidationSchema',
  RequestValidationSchemaDoc
);

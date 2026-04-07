import Joi from 'joi';

const MSG_KEYS = {
  required: 'any.required',
  stringMin: 'string.min',
  stringMax: 'string.max',
  stringPattern: 'string.pattern.base',
  stringEmail: 'string.email',
  stringUri: 'string.uri',
  stringGuid: 'string.guid',
  numberMin: 'number.min',
  numberMax: 'number.max',
  boolean: 'boolean.base',
};

/**
 * Builds Joi messages object from our FieldDefinition + rule key mapping.
 */
function fieldMessages(field, joiKeys) {
  const out = {};
  const map = field.messages instanceof Map ? field.messages : new Map(Object.entries(field.messages || {}));
  for (const [ourKey, joiKey] of Object.entries(joiKeys)) {
    const custom = map.get(ourKey);
    if (custom) out[joiKey] = custom;
  }
  return out;
}

/**
 * Applies common string rules: min, max, pattern (regex string), format, allowed.
 */
function applyStringRules(base, field) {
  const { rules = {} } = field;
  let schema = base;

  if (typeof rules.min === 'number') schema = schema.min(rules.min);
  if (typeof rules.max === 'number') schema = schema.max(rules.max);

  if (rules.pattern) {
    const re = new RegExp(rules.pattern);
    schema = schema.pattern(re);
  }

  if (rules.format === 'email') schema = schema.email({ tlds: { allow: false } });
  if (rules.format === 'uri') schema = schema.uri();
  if (rules.format === 'uuid') schema = schema.guid({ version: ['uuidv4', 'uuidv5'] });

  if (Array.isArray(rules.allowed) && rules.allowed.length)
    schema = schema.valid(...rules.allowed);

  return schema;
}

/**
 * Converts a single field definition from MongoDB into a Joi schema fragment.
 */
function fieldToJoi(field) {
  const { type, required, name } = field;
  const msgRequired = fieldMessages(field, { required: MSG_KEYS.required });

  let schema;

  switch (type) {
    case 'string': {
      schema = applyStringRules(Joi.string().trim(), field);
      schema = schema.messages({
        ...fieldMessages(field, {
          stringMin: MSG_KEYS.stringMin,
          stringMax: MSG_KEYS.stringMax,
          stringPattern: MSG_KEYS.stringPattern,
          stringEmail: MSG_KEYS.stringEmail,
          stringUri: MSG_KEYS.stringUri,
          stringGuid: MSG_KEYS.stringGuid,
        }),
      });
      if (!required) schema = schema.allow('').optional();
      break;
    }
    case 'number': {
      schema = Joi.number();
      const { rules = {} } = field;
      if (typeof rules.min === 'number') schema = schema.min(rules.min);
      if (typeof rules.max === 'number') schema = schema.max(rules.max);
      if (Array.isArray(rules.allowed) && rules.allowed.length)
        schema = schema.valid(...rules.allowed.map(Number));
      schema = schema.messages({
        ...fieldMessages(field, {
          numberMin: MSG_KEYS.numberMin,
          numberMax: MSG_KEYS.numberMax,
        }),
      });
      if (!required) schema = schema.empty('').optional();
      break;
    }
    case 'boolean': {
      schema = Joi.boolean().messages({
        ...fieldMessages(field, { boolean: MSG_KEYS.boolean }),
      });
      if (!required) schema = schema.optional();
      break;
    }
    default:
      throw new Error(`Unsupported field type for "${name}": ${type}`);
  }

  if (required) {
    schema = schema.required().messages(msgRequired);
  } else {
    schema = schema.optional();
  }

  return schema;
}

/**
 * Builds a full Joi object schema from a persisted RequestValidationSchema document.
 * Coercion (string → number/boolean) is enabled via validate options on the middleware.
 */
export function buildJoiSchemaFromDoc(doc) {
  const shape = {};
  for (const field of doc.fields) {
    shape[field.name] = fieldToJoi(field);
  }
  return Joi.object(shape);
}

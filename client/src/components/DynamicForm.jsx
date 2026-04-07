import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiFetch, getApiBase } from '../lib/api.js';
import { cn } from '../lib/utils.js';
import { Button } from './ui/button.jsx';
import { Input } from './ui/input.jsx';
import { Label } from './ui/label.jsx';

function initialValuesFromSchema(schema) {
  const v = {};
  if (!schema?.fields) return v;
  for (const f of schema.fields) {
    if (f.type === 'boolean') v[f.name] = false;
    else v[f.name] = '';
  }
  return v;
}

/**
 * Renders inputs from Mongo-backed schema and POSTs to the sample API route.
 */
export function DynamicForm({ schema, onResponse }) {
  const [values, setValues] = useState(() => initialValuesFromSchema(schema));
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const endpoint = useMemo(() => {
    if (!schema?.routeKey) return '';
    return `${getApiBase()}/${schema.routeKey}`;
  }, [schema]);

  /** Reset when switching schema definitions from the parent. */
  useEffect(() => {
    setValues(initialValuesFromSchema(schema));
    setFieldErrors({});
  }, [schema?.routeKey]);

  if (!schema?.fields?.length) {
    return (
      <p className="text-sm text-white/50">
        No fields in this schema — check MongoDB or run the seed script.
      </p>
    );
  }

  function updateField(name, raw) {
    setValues((prev) => ({ ...prev, [name]: raw }));
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldErrors({});
    setLoading(true);
    onResponse?.(null, 'neutral');

    const body = {};
    for (const f of schema.fields) {
      let val = values[f.name];
      if (f.type === 'number') {
        if (val === '' || val == null) {
          if (f.required) body[f.name] = val;
          continue;
        }
        body[f.name] = typeof val === 'number' ? val : Number(val);
      } else if (f.type === 'boolean') {
        body[f.name] = Boolean(val);
      } else {
        body[f.name] = val;
      }
    }

    try {
      const { res, json } = await apiFetch(`/${schema.routeKey}`, {
        method: schema.httpMethod || 'POST',
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(json?.message || 'Request accepted');
        onResponse?.(json, 'success');
      } else if (json?.error?.code === 'VALIDATION_FAILED') {
        const map = {};
        for (const item of json.error.fields || []) {
          map[item.path] = item.messages?.join(' ') || json.error.message;
        }
        setFieldErrors(map);
        toast.error(json.error.message || 'Validation failed', {
          description: `${json.error.fields?.length || 0} field(s) need attention`,
        });
        onResponse?.(json, 'error');
      } else {
        toast.error(json?.error?.message || `Error ${res.status}`);
        onResponse?.(json, 'error');
      }
    } catch (err) {
      toast.error('Network error — is the API running?');
      onResponse?.({ error: String(err.message || err) }, 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.form
      id="api-form"
      layout
      onSubmit={handleSubmit}
      className="glass-panel relative z-[1] mx-auto max-w-xl rounded-2xl p-6 md:p-8"
    >
      <div className="mb-6 flex flex-col gap-1 border-b border-white/10 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/40">
          Live request
        </p>
        <p className="break-all font-mono text-xs text-accent/90 md:text-sm">{endpoint}</p>
      </div>

      <div className="space-y-5">
        {schema.fields.map((field, i) => {
          const err = fieldErrors[field.name];
          return (
            <motion.div
              key={field.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="space-y-2"
            >
              <div className="flex items-baseline justify-between gap-2">
                <Label htmlFor={field.name}>
                  {field.name}
                  {field.required ? (
                    <span className="ml-1 text-accent">*</span>
                  ) : (
                    <span className="ml-1 text-white/25">(optional)</span>
                  )}
                </Label>
                <span className="font-mono text-[10px] text-white/30">{field.type}</span>
              </div>

              {field.type === 'boolean' ? (
                <label className="flex cursor-pointer items-center gap-3 text-sm text-white/80">
                  <input
                    type="checkbox"
                    id={field.name}
                    checked={Boolean(values[field.name])}
                    onChange={(e) => updateField(field.name, e.target.checked)}
                    className="h-4 w-4 rounded border-white/20 bg-white/5 accent-accent"
                  />
                  Enable
                </label>
              ) : (
                <Input
                  id={field.name}
                  type={field.type === 'number' ? 'number' : 'text'}
                  autoComplete="off"
                  value={values[field.name] ?? ''}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  placeholder={describeRules(field)}
                  className={cn(err && 'border-rose-400/50 ring-1 ring-rose-400/25')}
                />
              )}

              {err ? (
                <p className="text-xs text-rose-300/95 animate-in fade-in duration-200">{err}</p>
              ) : null}
            </motion.div>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="accent" className="min-w-[140px]" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Sending
            </>
          ) : (
            'Send request'
          )}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            setValues(initialValuesFromSchema(schema));
            setFieldErrors({});
            onResponse?.(null, 'neutral');
          }}
        >
          Reset
        </Button>
      </div>
    </motion.form>
  );
}

function describeRules(field) {
  const r = field.rules || {};
  const bits = [];
  if (typeof r.min === 'number') bits.push(`min ${r.min}`);
  if (typeof r.max === 'number') bits.push(`max ${r.max}`);
  if (r.format) bits.push(r.format);
  if (r.pattern) bits.push('regex');
  return bits.length ? bits.join(' · ') : '';
}

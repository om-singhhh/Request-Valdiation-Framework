import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { AlertCircle, Sparkles } from 'lucide-react';
import { apiFetch } from './lib/api.js';
import { BottomSchemaNav } from './components/BottomSchemaNav.jsx';
import { DynamicForm } from './components/DynamicForm.jsx';
import { HeroTitle } from './components/HeroTitle.jsx';
import { ResponsePanel } from './components/ResponsePanel.jsx';
import { SchemaMeta } from './components/SchemaMeta.jsx';
import { Button } from './components/ui/button.jsx';

export default function App() {
  const [schemas, setSchemas] = useState([]);
  const [schemasReady, setSchemasReady] = useState(false);
  const [activeKey, setActiveKey] = useState('register');
  const [loadError, setLoadError] = useState(null);
  const [responseBody, setResponseBody] = useState(null);
  const [responseVariant, setResponseVariant] = useState('neutral');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { res, json } = await apiFetch('/api/schemas');
        if (cancelled) return;
        if (!res.ok || !json?.ok) {
          setLoadError(json?.error?.message || `Could not load schemas (${res.status})`);
          setSchemas([]);
          return;
        }
        setLoadError(null);
        const data = json.data || [];
        setSchemas(data);
        const keys = data.map((s) => s.routeKey);
        setActiveKey((prev) => (keys.length && !keys.includes(prev) ? keys[0] : prev));
      } catch {
        if (!cancelled) setLoadError('Network error while loading schemas.');
      } finally {
        if (!cancelled) setSchemasReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeSchema = useMemo(
    () => schemas.find((s) => s.routeKey === activeKey) || null,
    [schemas, activeKey]
  );

  const onResponse = useCallback((payload, variant) => {
    setResponseBody(payload);
    setResponseVariant(variant || 'neutral');
  }, []);

  function scrollToForm() {
    document.getElementById('api-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <div className="flex min-h-full flex-col bg-black">
      <Toaster
        richColors
        theme="dark"
        position="top-center"
        toastOptions={{
          className: 'border border-white/10 bg-neutral-950 text-white',
        }}
      />

      <header className="divider flex items-center justify-between border-b px-4 py-4 md:px-10">
        <nav className="flex items-center gap-8 text-xs font-medium uppercase tracking-[0.2em] text-white/45">
          <a href="#overview" className="transition-colors hover:text-white">
            Info
          </a>
          <span className="relative text-white">
            Overview
            <span className="absolute -bottom-2 left-0 right-0 h-px bg-white/80" />
          </span>
        </nav>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.28em] text-white/80">
          <Sparkles className="h-4 w-4 text-accent" aria-hidden />
          Request Validation
        </div>
      </header>

      <main id="overview" className="flex flex-1 flex-col">
        <section className="px-4 pb-6 pt-8 md:px-10 md:pb-10 md:pt-12">
          <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:items-start">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-white/40">
                Runtime request contracts
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60 md:text-base">
                Schemas live in MongoDB. Joi builds validators on the fly with coercion, custom
                messages, and structured errors — wire up new APIs without shipping new validation
                code.
              </p>
            </motion.div>
            {activeSchema ? <SchemaMeta schema={activeSchema} /> : null}
          </div>

          <div className="relative mx-auto max-w-6xl">
            <HeroTitle text={activeSchema?.displayName || activeKey.toUpperCase()} />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Button
                type="button"
                variant="glass"
                size="icon"
                className="pointer-events-auto h-16 w-16 border-white/15 text-[10px] font-semibold uppercase tracking-widest text-white/80 backdrop-blur-xl"
                onClick={scrollToForm}
              >
                Test
              </Button>
            </div>
          </div>

          {loadError ? (
            <div className="mx-auto mb-6 flex max-w-xl items-start gap-3 rounded-xl border border-rose-400/25 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <div>
                <p className="font-medium">Could not reach the API.</p>
                <p className="mt-1 text-rose-100/80">{loadError}</p>
              </div>
            </div>
          ) : null}

          <div className="relative z-[1] px-0">
            {!schemasReady ? (
              <p className="text-center text-sm text-white/45">Loading schemas…</p>
            ) : activeSchema ? (
              <DynamicForm schema={activeSchema} onResponse={onResponse} />
            ) : (
              <p className="text-center text-sm text-white/45">
                No active schemas in MongoDB. From the <code className="text-white/70">server</code>{' '}
                folder run <code className="text-accent/90">npm run seed</code> and restart the API.
              </p>
            )}
            <ResponsePanel payload={responseBody} variant={responseVariant} />
          </div>
        </section>

        <footer className="mt-auto">
          <BottomSchemaNav
            schemas={schemas}
            activeKey={activeKey}
            onSelect={(key) => {
              setActiveKey(key);
              setResponseBody(null);
              setResponseVariant('neutral');
            }}
          />
        </footer>
      </main>
    </div>
  );
}

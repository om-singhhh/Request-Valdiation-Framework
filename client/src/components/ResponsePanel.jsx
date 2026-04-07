import { motion, AnimatePresence } from 'framer-motion';

/**
 * Pretty JSON preview for last API response (success or raw error body).
 */
export function ResponsePanel({ payload, variant = 'neutral' }) {
  if (payload == null) return null;

  const border =
    variant === 'success'
      ? 'border-emerald-400/25'
      : variant === 'error'
        ? 'border-rose-400/25'
        : 'border-white/10';

  return (
    <AnimatePresence>
      <motion.div
        key={JSON.stringify(payload).slice(0, 120)}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className={`glass-panel mt-8 rounded-xl border ${border}`}
      >
        <div className="border-b border-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/40">
          Response
        </div>
        <pre className="max-h-[320px] overflow-auto p-4 text-left text-xs leading-relaxed text-white/80 md:text-sm">
          {JSON.stringify(payload, null, 2)}
        </pre>
      </motion.div>
    </AnimatePresence>
  );
}

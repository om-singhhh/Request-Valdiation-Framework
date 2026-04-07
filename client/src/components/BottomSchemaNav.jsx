import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils.js';

/**
 * Horizontal schema switcher — premium dark UI with accent selection.
 */
export function BottomSchemaNav({ schemas, activeKey, onSelect, className }) {
  if (!schemas?.length) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-6 border-t border-white/10 px-4 py-5 md:px-10',
        className
      )}
    >
      <nav className="flex flex-wrap items-center gap-6 md:gap-10">
        {schemas.map((s, i) => {
          const active = s.routeKey === activeKey;
          const num = String(i + 1).padStart(2, '0');
          return (
            <button
              key={s.routeKey}
              type="button"
              onClick={() => onSelect(s.routeKey)}
              className={cn(
                'group flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] transition-colors duration-300 md:text-sm',
                active ? 'text-accent' : 'text-white/45 hover:text-white/75'
              )}
            >
              <ChevronRight
                className={cn(
                  'h-3.5 w-3.5 transition-transform duration-300',
                  active ? 'text-accent' : 'text-white/25 group-hover:translate-x-0.5'
                )}
                aria-hidden
              />
              <span className="relative flex items-center gap-2">
                {active && (
                  <motion.span
                    layoutId="nav-triangle"
                    className="inline-block h-0 w-0 border-x-[5px] border-b-[6px] border-x-transparent border-b-accent"
                    aria-hidden
                  />
                )}
                <span>
                  {num} — {s.displayName || s.routeKey}
                </span>
              </span>
            </button>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-widest text-white/35">
        <span>
          {String(schemas.findIndex((s) => s.routeKey === activeKey) + 1 || 1).padStart(2, '0')} —{' '}
          {String(schemas.length).padStart(2, '0')}
        </span>
        <span className="text-white/20" aria-hidden>
          ↕
        </span>
      </div>
    </div>
  );
}

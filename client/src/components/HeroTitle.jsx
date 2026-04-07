import { motion } from 'framer-motion';

/**
 * Large editorial “3D” title — visual anchor for the dashboard (see reference UI).
 */
export function HeroTitle({ text }) {
  return (
    <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center py-6 md:py-10">
      <motion.h1
        className="title-3d text-center text-[clamp(2.75rem,14vw,8.5rem)]"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      >
        {text}
      </motion.h1>
    </div>
  );
}

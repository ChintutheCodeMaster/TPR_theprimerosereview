import { motion, useReducedMotion, type MotionProps } from "framer-motion";
import type { ReactNode, CSSProperties } from "react";

type Props = MotionProps & {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  delay?: number;
  y?: number;
  blur?: number;
};

export function FadeIn({ children, className, style, delay = 0, y = 18, blur = 8, ...rest }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/** Cinematic section wrapper — matte black, deep vertical rhythm. */
export function Section({
  id,
  children,
  className = "",
  eyebrow,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  eyebrow?: string;
}) {
  return (
    <section id={id} className={`relative border-t border-white/5 py-20 md:py-40 ${className}`}>
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {eyebrow && (
          <FadeIn>
            <div className="mb-6 font-mono text-[10px] uppercase tracking-[0.28em] text-white/45">
              {eyebrow}
            </div>
          </FadeIn>
        )}
        {children}
      </div>
    </section>
  );
}

export const pink = "#f7c8e0";

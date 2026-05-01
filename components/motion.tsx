"use client";

import { motion, useInView, useScroll, useTransform, AnimatePresence, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/*  Reusable scroll-triggered wrapper                                  */
/* ------------------------------------------------------------------ */

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Direction the element slides from */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Extra delay in seconds */
  delay?: number;
  /** How far off-screen (px) */
  distance?: number;
  /** InView threshold 0-1 */
  threshold?: number;
  /** Play only once */
  once?: boolean;
  /** Duration in seconds */
  duration?: number;
}

const offsetMap = {
  up: { y: 1, x: 0 },
  down: { y: -1, x: 0 },
  left: { x: 1, y: 0 },
  right: { x: -1, y: 0 },
  none: { x: 0, y: 0 },
};

export function Reveal({
  children,
  className,
  direction = "up",
  delay = 0,
  distance = 40,
  threshold = 0.15,
  once = true,
  duration = 0.7,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const d = offsetMap[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, x: d.x * distance, y: d.y * distance }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : undefined}
      transition={{ duration, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stagger container                                                  */
/* ------------------------------------------------------------------ */

interface StaggerProps {
  children: ReactNode;
  className?: string;
  /** Delay between children in seconds */
  stagger?: number;
  /** Base delay before first child */
  delay?: number;
  threshold?: number;
  once?: boolean;
}

export const staggerContainer: Variants = {
  hidden: {},
  visible: (custom: { stagger?: number; delay?: number }) => ({
    transition: {
      staggerChildren: custom?.stagger ?? 0.1,
      delayChildren: custom?.delay ?? 0,
    },
  }),
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerItemLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

export const staggerItemScale: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Stagger({
  children,
  className,
  stagger = 0.1,
  delay = 0,
  threshold = 0.1,
  once = true,
}: StaggerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={staggerContainer}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={{ stagger, delay }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Parallax scroll wrapper                                            */
/* ------------------------------------------------------------------ */

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Speed factor: 0 = static, 1 = full scroll speed */
  speed?: number;
  /** Use for background images */
  asBackground?: boolean;
}

export function Parallax({
  children,
  className,
  speed = 0.3,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [speed * -100, speed * 100]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className ?? ""}`}>
      <motion.div style={{ y }}>{children}</motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Text reveal — words animate in one by one                         */
/* ------------------------------------------------------------------ */

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  /** per-word stagger */
  stagger?: number;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}

export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.04,
  as: Tag = "h2",
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const words = text.split(" ");

  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} className={className}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="inline-block mr-[0.3em]"
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={
            isInView
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : undefined
          }
          transition={{
            duration: 0.5,
            delay: delay + i * stagger,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}

/* ------------------------------------------------------------------ */
/*  Magnetic hover — element follows cursor on hover                   */
/* ------------------------------------------------------------------ */

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** Strength of the magnetic pull (lower = stronger) */
  strength?: number;
}

export function Magnetic({ children, className, strength = 3 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / strength;
    const y = (e.clientY - rect.top - rect.height / 2) / strength;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const handleMouseLeave = () => {
    if (ref.current) ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <div
      ref={ref}
      className={`transition-transform duration-300 ease-out ${className ?? ""}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Floating particles — decorative background elements                */
/* ------------------------------------------------------------------ */

interface FloatingParticleProps {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  x?: number;
  y?: number;
}

export function FloatingParticle({
  className = "bg-primary/10",
  size = 8,
  duration = 6,
  delay = 0,
  x = 0,
  y = 0,
}: FloatingParticleProps) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      style={{ width: size, height: size, left: `${x}%`, top: `${y}%` }}
      animate={{
        y: [0, -20, 0, 15, 0],
        x: [0, 10, -5, 8, 0],
        scale: [1, 1.2, 0.9, 1.1, 1],
        opacity: [0.4, 0.8, 0.5, 0.7, 0.4],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Scroll-triggered line draw                                         */
/* ------------------------------------------------------------------ */

interface DrawLineProps {
  className?: string;
}

export function DrawLine({ className }: DrawLineProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.8", "end 0.4"],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <div ref={ref} className={className}>
      <motion.div
        className="h-full w-full bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 origin-left"
        style={{ scaleX }}
      />
    </div>
  );
}

/* Re-export motion for convenience */
export { motion, useInView, useScroll, useTransform, AnimatePresence };
export type { Variants };

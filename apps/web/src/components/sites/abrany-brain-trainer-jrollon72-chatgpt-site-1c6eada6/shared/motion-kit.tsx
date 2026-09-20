"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import {
  animate,
  motion,
  MotionConfig,
  useAnimationFrame,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
  type HTMLMotionProps,
  type MotionValue,
  type Variants,
} from "motion/react";

export const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

export const stagger = (step = 0.07, delay = 0.1): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: step, delayChildren: delay } },
});

export const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: EASE } },
};

export const fade: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 1.1, ease: EASE } },
};

export const wipe = (radius = 40): Variants => ({
  hidden: { opacity: 0, y: 34, clipPath: `inset(16% 0% 0% 0% round ${radius}px)` },
  show: {
    opacity: 1,
    y: 0,
    clipPath: `inset(0% 0% 0% 0% round ${radius}px)`,
    transition: { duration: 1, ease: EASE },
  },
});

export const bloom: Variants = {
  hidden: { opacity: 0, scale: 1.05 },
  show: { opacity: 1, scale: 1, transition: { duration: 1.4, ease: EASE } },
};

export const maskWord: Variants = {
  hidden: { y: "115%" },
  show: { y: "0%", transition: { duration: 0.95, ease: EASE } },
};

export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function RevealGroup({
  children,
  step = 0.08,
  className = "",
}: {
  children: ReactNode;
  step?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={stagger(step, 0.05)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-12% 0px -12% 0px" }}
    >
      {children}
    </motion.div>
  );
}

export function Reveal({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & HTMLMotionProps<"div">) {
  return (
    <motion.div variants={rise} className={className} {...rest}>
      {children}
    </motion.div>
  );
}

let lenisInstance: Lenis | null = null;

export const setSmoothScroll = (on: boolean) => {
  if (on) lenisInstance?.start();
  else lenisInstance?.stop();
};

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const prev = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, touchMultiplier: 1.6 });
    lenisInstance = lenis;
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.button !== 0) return;
      const anchor = (e.target as Element | null)?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!anchor || anchor.getAttribute("href") === "#") return;
      const target = document.querySelector<HTMLElement>(anchor.hash);
      if (target) {
        e.preventDefault();
        lenis.scrollTo(target, { offset: -8, duration: 1.15 });
      }
    };
    document.addEventListener("click", onClick);
    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisInstance = null;
      document.documentElement.style.scrollBehavior = prev;
    };
  }, []);
  return null;
}

export function useHeroParallax(cols: number) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const unit = useMotionValue(1);
  const reduced = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const update = () => unit.set(stage.clientWidth / cols);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [cols, unit]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end start"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 5e-4 });
  const layer = (k: number) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks -- fixed call order, mirrors the original
    useTransform([progress, unit], ([p, u]: number[]) => (reduced ? 0 : p * k * u));

  return {
    sectionRef,
    stageRef,
    y: { far: layer(132), mid: layer(86), brain: layer(48), near: layer(-34), front: layer(-66) },
    progress,
    reduced,
  };
}

export function Magnetic({
  children,
  strength = 0.3,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 170, damping: 16, mass: 0.4 });
  const y = useSpring(my, { stiffness: 170, damping: 16, mass: 0.4 });
  const reduced = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ x, y }}
      onMouseMove={(e) => {
        if (reduced) return;
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - (r.left + r.width / 2)) * strength);
        my.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onMouseLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

export function Spotlight({
  children,
  className = "",
  radius = 260,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const background = useMotionTemplate`radial-gradient(${radius}px circle at ${x}px ${y}px, rgba(255,255,255,0.35), transparent 68%)`;
  return (
    <div
      className={`group/spot relative ${className}`}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        x.set(e.clientX - r.left);
        y.set(e.clientY - r.top);
      }}
      onMouseLeave={() => {
        x.set(-9999);
        y.set(-9999);
      }}
    >
      <motion.span
        style={{ background }}
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
      />
      {children}
    </div>
  );
}

export function Drift({ className, distance = 90 }: { className: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance]);
  return (
    <div ref={ref} className={`pointer-events-none absolute ${className}`} aria-hidden>
      <motion.span style={{ y }} className="block h-full w-full rounded-full bg-white/30 blur-[80px]" />
    </div>
  );
}

export function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => setValue(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, reduced]);
  return (
    <span ref={ref} className="tabular-nums">
      {inView && reduced ? to : value}
      {suffix}
    </span>
  );
}

export function Marquee({ words, baseVelocity = -2.2 }: { words: string[]; baseVelocity?: number }) {
  const base = useMotionValue(0);
  const direction = useRef(1);
  const { scrollY } = useScroll();
  const velocity: MotionValue<number> = useTransform(
    useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 }),
    [-1200, 0, 1200],
    [-2.4, 0, 2.4],
    { clamp: false },
  );
  const x = useTransform(base, (v) => `${wrap(-25, 0, v)}%`);
  const reduced = useReducedMotion();

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    let move = direction.current * baseVelocity * (delta / 1000);
    const v = velocity.get();
    if (v < 0) direction.current = -1;
    else if (v > 0) direction.current = 1;
    move += direction.current * move * Math.abs(v);
    base.set(base.get() + move);
  });

  const row = (
    <span className="flex shrink-0 items-center">
      {words.map((w) => (
        <span key={w} className="flex items-center">
          <span className="px-8 font-display text-[7vw] font-semibold uppercase leading-none tracking-[-0.03em] text-ink/25 lg:text-[4vw]">
            {w}
          </span>
          <i aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-ink/25" />
        </span>
      ))}
    </span>
  );

  return (
    <div aria-hidden className="relative w-full overflow-hidden border-y border-ink/10 py-7">
      <motion.div style={{ x }} className="flex w-max flex-nowrap">
        {row}
        {row}
        {row}
        {row}
      </motion.div>
    </div>
  );
}

type MenuState = { open: boolean; toggle: () => void; close: () => void };
const MenuContext = createContext<MenuState | null>(null);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const value: MenuState = {
    open,
    toggle: () => setOpen((o) => !o),
    close: () => setOpen(false),
  };
  useEffect(() => {
    document.body.dataset.locked = open ? "true" : "false";
    setSmoothScroll(!open);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (open) window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.dataset.locked = "false";
    };
  }, [open]);
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export const useMenu = () => {
  const ctx = useContext(MenuContext);
  if (!ctx) throw Error("MenuProvider is required");
  return ctx;
};

export function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    const update = () => {
      const line = window.innerHeight / 3;
      let current = ids[0];
      els.forEach((el) => {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      });
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [ids]);
  return active;
}

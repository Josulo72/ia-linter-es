"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring, type Variants } from "motion/react";
import { EASE, useMenu } from "../shared/motion-kit";
import { CHROME, NAV } from "./content";
import { Logo, MenuButton } from "./primitives";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-ink/70"
    />
  );
}

export function StickyHeader({ active }: { active: string }) {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);
  const { open } = useMenu();
  useMotionValueEvent(scrollY, "change", (v) => setVisible(v > window.innerHeight * 0.75));

  return (
    <AnimatePresence>
      {visible && !open && (
        <motion.header
          initial={{ y: "-100%" }}
          animate={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.5, ease: EASE }}
          className="fixed inset-x-0 top-0 z-40 border-b border-ink/10 bg-sky/80 backdrop-blur-xl"
        >
          <div className="mx-auto flex h-16 w-full max-w-[1440px] items-center justify-between px-6 md:px-10">
            <a href="#home">
              <Logo />
            </a>
            <nav className="hidden items-center gap-10 md:flex">
              {NAV.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  aria-current={active === item.id ? "page" : undefined}
                  className={`font-display text-xs capitalize text-ink transition-opacity duration-300 hover:opacity-100 ${
                    active === item.id ? "opacity-100" : "opacity-40"
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-5">
              <a
                href="#pricing"
                className="hidden rounded-full bg-ink px-5 py-2 font-sans text-xs font-semibold text-sky transition-opacity hover:opacity-85 sm:block"
              >
                {CHROME.cta}
              </a>
              <MenuButton width="22.76px" gap="4.56px" />
            </div>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}

const overlay: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE, staggerChildren: 0.05, delayChildren: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.28, ease: EASE, when: "afterChildren" } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: EASE } },
};

export function MenuOverlay() {
  const { open, close } = useMenu();
  const firstLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (open) firstLink.current?.focus();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="site-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menú del sitio"
          variants={overlay}
          initial="hidden"
          animate="show"
          exit="exit"
          className="fixed inset-0 z-50 flex flex-col bg-sky/95 px-6 backdrop-blur-2xl md:px-10"
        >
          <div className="flex h-16 items-center justify-between">
            <Logo />
            <MenuButton width="22.76px" gap="4.56px" />
          </div>
          <motion.nav className="flex flex-1 flex-col justify-center">
            {NAV.map((entry, i) => (
              <motion.a
                key={entry.id}
                ref={i === 0 ? firstLink : undefined}
                variants={item}
                onClick={close}
                href={`#${entry.id}`}
                className="group flex items-baseline justify-between border-b border-ink/12 py-5 md:py-7"
              >
                <span className="font-display text-[13vw] font-semibold uppercase leading-[0.9] tracking-[-0.03em] text-ink transition-opacity duration-300 group-hover:opacity-55 md:text-[7vw]">
                  {entry.label}
                </span>
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-ink/40">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </motion.a>
            ))}
          </motion.nav>
          <motion.div variants={item} className="flex items-end justify-between gap-8 pb-9">
            <p className="max-w-[34ch] font-sans text-sm leading-relaxed text-ink/70">
              Cuatro dominios cognitivos, un plan adaptativo. Medido en cada sesión y reevaluado cada mes.
            </p>
            <a
              href="#contact"
              onClick={close}
              className="font-display text-xs uppercase tracking-[0.16em] text-ink underline-offset-4 hover:underline"
            >
              Contacto
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

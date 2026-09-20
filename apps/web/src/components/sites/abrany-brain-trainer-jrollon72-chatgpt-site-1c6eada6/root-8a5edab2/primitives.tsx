"use client";

import { Fragment, type ReactNode } from "react";
import { motion } from "motion/react";
import { EASE, maskWord, Reveal, stagger, useMenu } from "../shared/motion-kit";
import { IMG, PKG } from "./content";

/** Text that rolls up to a duplicate on parent `group` hover. */
export function RollText({ children }: { children: ReactNode }) {
  return (
    <span className="relative block overflow-hidden">
      <span className="block transition-transform duration-500 ease-out group-hover:-translate-y-full">{children}</span>
      <span
        aria-hidden
        className="absolute left-0 top-0 block translate-y-full transition-transform duration-500 ease-out group-hover:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}

export function Logo({ label = true }: { label?: boolean }) {
  return (
    <span className="flex items-center gap-1">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={IMG.logoMark} alt="" className="h-4 w-4 object-contain" />
      {label && <span className="font-wide text-[10px] tracking-[-0.06em] text-ink">{PKG.name}</span>}
    </span>
  );
}

export function MenuButton({ width, gap, className = "" }: { width: string; gap: string; className?: string }) {
  const { open, toggle } = useMenu();
  return (
    <button
      type="button"
      onClick={toggle}
      className={`group relative flex flex-col justify-center ${className}`}
      style={{ width, gap, height: `calc(${gap} + 2px)` }}
      aria-label={open ? "Cerrar el menú" : "Abrir el menú"}
      aria-expanded={open}
      aria-controls="site-menu"
    >
      {[0, 1].map((i) => (
        <motion.span
          key={i}
          className="block h-px w-full origin-center bg-ink"
          animate={open ? { rotate: i === 0 ? 45 : -45, y: i === 0 ? "50%" : "-50%" } : { rotate: 0, y: "0%" }}
          transition={{ duration: 0.4, ease: EASE }}
        />
      ))}
    </button>
  );
}

export function Section({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="relative w-full scroll-mt-24 border-t border-ink/10 py-20 md:py-28 lg:py-36">
      <div className="relative z-10 mx-auto w-full max-w-[1440px] px-6 md:px-10">{children}</div>
    </section>
  );
}

export function Eyebrow({ index, label }: { index: string; label: string }) {
  return (
    <Reveal className="mb-8 flex items-center gap-5">
      <span className="font-display text-sm font-semibold uppercase tracking-[-0.03em] text-ink">{index}</span>
      <motion.span
        variants={{ hidden: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 0.7, ease: EASE } } }}
        className="h-px w-10 origin-left bg-ink/50"
      />
      <span className="font-sans text-xs uppercase tracking-[.18em] text-ink/60">{label}</span>
    </Reveal>
  );
}

function SplitWords({ text }: { text: string }) {
  const words = text.split(" ");
  return (
    <motion.span variants={stagger(0.045, 0)}>
      {words.map((word, i) => (
        // El espacio va fuera del span recortado: dentro, el overflow-hidden se lo come.
        <Fragment key={`${word}-${i}`}>
          <span className="inline-block overflow-hidden pb-[.12em] align-bottom">
            <motion.span variants={maskWord} className="inline-block will-change-transform">
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </motion.span>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="max-w-[18ch] font-display text-[10vw] font-semibold uppercase leading-[.9] tracking-[-.03em] text-ink sm:text-[7vw] lg:text-[4.4vw]">
      <SplitWords text={children} />
    </h2>
  );
}

export function Lede({ children }: { children: ReactNode }) {
  return (
    <Reveal className="mt-6">
      <p className="max-w-[46ch] font-sans text-base leading-[1.55] text-ink/75">{children}</p>
    </Reveal>
  );
}

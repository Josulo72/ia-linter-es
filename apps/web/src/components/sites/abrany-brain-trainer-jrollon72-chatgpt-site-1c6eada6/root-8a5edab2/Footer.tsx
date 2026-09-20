"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { EASE, Magnetic, maskWord, Reveal, RevealGroup, stagger } from "../shared/motion-kit";
import { FOOTER, FOOTER_COLUMNS, HERO, IMG, INSTALL_COMMAND, PKG } from "./content";
import { ArrowRightIcon } from "./icons";
import { Logo, RollText } from "./primitives";

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(INSTALL_COMMAND);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  const note = copied ? FOOTER.installDone : FOOTER.installIdle;

  return (
    <footer id="contact" className="relative scroll-mt-20 border-t border-ink/10">
      <div className="mx-auto w-full max-w-[1440px] px-6 md:px-10">
        <RevealGroup className="flex flex-col gap-10 py-20 md:py-28 lg:flex-row lg:items-end lg:justify-between">
          <motion.p
            variants={stagger(0.1, 0)}
            className="font-display text-[13vw] font-semibold uppercase leading-[.88] tracking-[-.03em] text-ink sm:text-[8vw] lg:text-[5.4vw]"
          >
            {HERO.badge.map((w) => (
              <span key={w} className="block overflow-hidden">
                <motion.span variants={maskWord} className="block whitespace-nowrap will-change-transform">
                  {w}
                </motion.span>
              </span>
            ))}
          </motion.p>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <motion.img
              src={IMG.brainBadge}
              alt=""
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
              className="h-28 w-28 object-contain"
            />
            <Magnetic strength={0.3}>
              <a
                href="#pricing"
                className="group flex items-center gap-5 rounded-full bg-ink py-4 pl-7 pr-5 font-sans text-sm font-semibold text-sky transition-opacity hover:opacity-85"
              >
                <RollText>{FOOTER.cta}</RollText>
                <ArrowRightIcon className="h-5 w-5 transition-transform duration-500 ease-out group-hover:translate-x-1" />
              </a>
            </Magnetic>
          </div>
        </RevealGroup>

        <RevealGroup className="grid gap-12 border-t border-ink/10 py-16 md:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,.6fr))] lg:gap-10">
          <Reveal>
            <Logo />
            <div className="mt-8 flex w-full max-w-md flex-col gap-3">
              <span className="font-sans text-xs uppercase tracking-[.18em] text-ink/50">{FOOTER.installLabel}</span>
              <div className="flex items-center gap-3 rounded-full border border-transparent bg-white/45 py-2 pl-6 pr-2">
                <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap bg-transparent font-mono text-sm text-ink">
                  {INSTALL_COMMAND}
                </code>
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copiar la orden"
                  aria-describedby="install-note"
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink text-sky"
                >
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              </div>
              <AnimatePresence mode="wait">
                <motion.p
                  key={note}
                  id="install-note"
                  role="status"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="font-sans text-xs text-ink/60"
                >
                  {note}
                </motion.p>
              </AnimatePresence>
            </div>
          </Reveal>
          {FOOTER_COLUMNS.map((col) => (
            <Reveal key={col.title}>
              <h3 className="font-sans text-xs uppercase tracking-[.18em] text-ink/50">{col.title}</h3>
              <ul className="mt-5 flex flex-col gap-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href={PKG.repo} target="_blank" rel="noreferrer" className="group font-sans text-sm text-ink/75">
                      <RollText>{link}</RollText>
                    </a>
                  </li>
                ))}
              </ul>
            </Reveal>
          ))}
        </RevealGroup>

        <div className="flex flex-col gap-4 border-t border-ink/10 py-8 md:flex-row md:items-center md:justify-between">
          <p className="max-w-[60ch] font-sans text-xs leading-relaxed text-ink/45">{FOOTER.disclaimer}</p>
          <p className="font-sans text-xs text-ink/45">
            © {new Date().getFullYear()} {PKG.name}. {FOOTER.rights}
          </p>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Counter, Drift, EASE, Magnetic, Reveal, RevealGroup, Spotlight, wipe } from "../shared/motion-kit";
import { COURSES, FAQ, LIMITES, PLANS, REGISTROS, SECTIONS, STATS, STEPS, TRAINERS } from "./content";
import { ArrowRightIcon, BrainIcon } from "./icons";
import { Eyebrow, Lede, Section, SectionTitle } from "./primitives";

export function Courses() {
  const [activeId, setActiveId] = useState(COURSES[0].id);
  const course = COURSES.find((c) => c.id === activeId) ?? COURSES[0];

  return (
    <Section id="courses">
      <Drift className="right-[8%] top-[18%] h-[26rem] w-[26rem]" />
      <RevealGroup>
        <Eyebrow index={SECTIONS.courses.index} label={SECTIONS.courses.label} />
        <SectionTitle>{SECTIONS.courses.title}</SectionTitle>
        <Lede>{SECTIONS.courses.lede}</Lede>
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <ul className="flex flex-col">
            {COURSES.map((c, i) => {
              const isActive = c.id === activeId;
              return (
                <li key={c.id} className="relative">
                  <button
                    onClick={() => setActiveId(c.id)}
                    aria-pressed={isActive}
                    className="group flex w-full items-center justify-between gap-6 border-b border-ink/10 py-6 text-left"
                  >
                    <span className="font-sans text-xs tabular-nums text-ink/40">{String(i + 1).padStart(2, "0")}</span>
                    <span
                      className={`flex-1 font-display text-2xl font-semibold uppercase leading-none tracking-[-.03em] text-ink transition-[opacity,transform] duration-500 ease-out group-hover:translate-x-2 sm:text-3xl ${
                        isActive ? "opacity-100" : "opacity-40 group-hover:opacity-75"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="hidden font-sans text-xs uppercase tracking-[.16em] text-ink/50 sm:block">{c.level}</span>
                    <motion.span
                      animate={{ rotate: isActive ? 90 : 0, opacity: isActive ? 1 : 0.35 }}
                      transition={{ duration: 0.4, ease: EASE }}
                    >
                      <ArrowRightIcon className="h-5 w-5" />
                    </motion.span>
                  </button>
                  {isActive && (
                    <motion.span
                      layoutId="course-rule"
                      aria-hidden
                      className="absolute inset-x-0 bottom-0 h-px bg-ink"
                      transition={{ duration: 0.45, ease: EASE }}
                    />
                  )}
                </li>
              );
            })}
          </ul>
          <motion.div variants={wipe(40)}>
            <Spotlight className="glass flex min-h-[22rem] h-full flex-col justify-between overflow-hidden rounded-[40px] p-8 sm:p-10">
              <span className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/12 blur-2xl" />
              <AnimatePresence mode="wait">
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="relative flex h-full flex-col justify-between gap-12"
                >
                  <div>
                    <span className="mb-9 grid h-14 w-14 place-items-center rounded-full bg-orb text-white">
                      <BrainIcon className="h-6 w-6" />
                    </span>
                    <h3 className="font-display text-3xl font-semibold uppercase leading-none tracking-[-.03em] text-ink">
                      {course.name}
                    </h3>
                    <p className="mt-5 max-w-[42ch] font-sans text-[.95rem] leading-[1.6] text-ink/75">{course.blurb}</p>
                  </div>
                  <dl className="flex flex-wrap gap-3">
                    {course.metrics.map((m) => (
                      <div key={m.label} className="glass-tile flex min-w-[9.5rem] flex-1 flex-col gap-1 rounded-2xl px-5 py-4">
                        <dd className="order-1 font-sans text-xl font-semibold tracking-[-.02em] text-ink">{m.value}</dd>
                        <dt className="order-2 font-sans text-xs font-light text-ink/60">{m.label}</dt>
                      </div>
                    ))}
                  </dl>
                </motion.div>
              </AnimatePresence>
            </Spotlight>
          </motion.div>
        </div>
      </RevealGroup>
    </Section>
  );
}

export function Method() {
  return (
    <Section id="method">
      <Drift className="-left-[6%] top-[30%] h-[30rem] w-[30rem]" distance={130} />
      <div className="grid gap-14 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <RevealGroup className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow index={SECTIONS.method.index} label={SECTIONS.method.label} />
          <SectionTitle>{SECTIONS.method.title}</SectionTitle>
          <Lede>{SECTIONS.method.lede}</Lede>
        </RevealGroup>
        <RevealGroup>
          <ol className="flex flex-col gap-4">
            {STEPS.map((s) => (
              <motion.li key={s.step} variants={wipe(32)}>
                <Spotlight className="glass flex flex-col gap-5 overflow-hidden rounded-[32px] p-8 sm:p-10">
                  <div className="flex items-center gap-5">
                    <span className="font-display text-5xl font-semibold uppercase leading-none tracking-[-.03em] text-ink/25">
                      {s.step}
                    </span>
                    <i className="h-px flex-1 bg-ink/15" />
                  </div>
                  <h3 className="font-display text-2xl font-semibold uppercase leading-none tracking-[-.03em] text-ink">
                    {s.title}
                  </h3>
                  <p className="max-w-[52ch] font-sans text-[.95rem] leading-[1.6] text-ink/75">{s.body}</p>
                </Spotlight>
              </motion.li>
            ))}
          </ol>
        </RevealGroup>
      </div>
      <RevealGroup step={0.1} className="mt-16 lg:mt-24">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-[40px] bg-ink/10 lg:grid-cols-4">
          {STATS.map((s) => (
            <Reveal
              key={s.label}
              className="group flex flex-col gap-2 bg-sky px-6 py-9 transition-colors duration-500 hover:bg-white/35 sm:px-8"
            >
              <dd className="font-display text-4xl font-normal uppercase leading-none tracking-[-.03em] text-ink transition-transform duration-500 ease-out group-hover:-translate-y-1 sm:text-5xl">
                <Counter to={s.value} suffix={s.suffix} />
              </dd>
              <dt className="font-sans text-sm font-light text-ink/60">{s.label}</dt>
            </Reveal>
          ))}
        </dl>
      </RevealGroup>
    </Section>
  );
}

export function Trainers() {
  return (
    <Section id="trainers">
      <Drift className="right-[2%] bottom-[10%] h-[24rem] w-[24rem]" distance={70} />
      <RevealGroup>
        <Eyebrow index={SECTIONS.trainers.index} label={SECTIONS.trainers.label} />
        <SectionTitle>{SECTIONS.trainers.title}</SectionTitle>
        <Lede>{SECTIONS.trainers.lede}</Lede>
        <ul className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {TRAINERS.map((t, i) => (
            <motion.li key={t.name} variants={wipe(32)}>
              <Spotlight className="glass group flex h-full flex-col gap-6 overflow-hidden rounded-[32px] p-7 transition-colors duration-500 hover:bg-white/25">
                <span className="grid h-14 w-14 place-items-center rounded-full border border-ink/15 bg-white/30 font-sans text-sm tabular-nums text-ink/60 transition-transform duration-700 ease-out group-hover:scale-110">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-[-.03em] text-ink">
                    {t.name}
                  </h3>
                  <p className="mt-2 font-sans text-xs uppercase tracking-[.16em] text-ink/50">{t.role}</p>
                </div>
                <i className="h-px w-full origin-left scale-x-0 bg-ink/30 transition-transform duration-700 ease-out group-hover:scale-x-100" />
                <p className="font-sans text-sm leading-[1.6] text-ink/70">{t.line}</p>
              </Spotlight>
            </motion.li>
          ))}
        </ul>
      </RevealGroup>
    </Section>
  );
}

/** Una barra a izquierda o derecha de un cero central, según el signo de la separación. */
function Barra({ valor }: { valor: number }) {
  const reduced = useReducedMotion();
  const ancho = `${(Math.abs(valor) / REGISTROS.max) * 50}%`;
  const positivo = valor > 0;
  return (
    <span aria-hidden className="relative block h-6">
      <i className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink/20" />
      <motion.i
        className={`absolute top-1/2 block h-2.5 -translate-y-1/2 rounded-full ${positivo ? "left-1/2 bg-ink" : "right-1/2 bg-ink/25"}`}
        initial={{ width: 0 }}
        whileInView={{ width: ancho }}
        viewport={{ once: true, margin: "-15% 0px" }}
        transition={{ duration: reduced ? 0 : 0.9, ease: EASE }}
      />
    </span>
  );
}

export function Limites() {
  return (
    <Section id="limites">
      <Drift className="left-[4%] top-[22%] h-[26rem] w-[26rem]" distance={90} />
      <RevealGroup>
        <Eyebrow index={SECTIONS.limites.index} label={SECTIONS.limites.label} />
        <SectionTitle>{SECTIONS.limites.title}</SectionTitle>
        <Lede>{SECTIONS.limites.lede}</Lede>
        <div className="mt-14 grid gap-8 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] lg:gap-16">
          <motion.div variants={wipe(40)} className="lg:sticky lg:top-28 lg:self-start">
            <Spotlight className="glass flex flex-col gap-8 overflow-hidden rounded-[40px] p-8 sm:p-10">
              <h3 className="font-display text-2xl font-semibold uppercase leading-none tracking-[-.03em] text-ink">
                {REGISTROS.title}
              </h3>
              <ul className="flex flex-col gap-5">
                {REGISTROS.filas.map((f) => (
                  <li key={f.id} className="grid grid-cols-[4.5rem_minmax(0,1fr)_5.5rem] items-center gap-3 sm:gap-4">
                    <span className="font-sans text-xs uppercase tracking-[.14em] text-ink/60">{f.name}</span>
                    <Barra valor={f.valor} />
                    <span className="text-right">
                      <span className="block font-sans text-sm font-semibold tabular-nums text-ink">{f.texto}</span>
                      <span className="block whitespace-nowrap font-sans text-[.6rem] leading-tight text-ink/45">
                        {f.detalle}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="font-sans text-xs leading-[1.7] text-ink/55">{REGISTROS.nota}</p>
            </Spotlight>
          </motion.div>
          <ul className="flex flex-col">
            {LIMITES.map((l, i) => (
              <motion.li key={l.title} variants={wipe(28)} className="border-b border-ink/12 py-6 first:border-t first:pt-0 lg:first:pt-6">
                <div className="flex items-start gap-5">
                  <span className="mt-1 font-sans text-xs tabular-nums text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="font-display text-lg font-semibold uppercase leading-tight tracking-[-.02em] text-ink">
                      {l.title}
                    </h3>
                    <p className="mt-2 max-w-[52ch] font-sans text-sm leading-[1.6] text-ink/70">{l.body}</p>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </RevealGroup>
    </Section>
  );
}

export function Pricing() {
  return (
    <Section id="pricing">
      <Drift className="left-[30%] top-[6%] h-[28rem] w-[28rem]" distance={110} />
      <RevealGroup>
        <Eyebrow index={SECTIONS.pricing.index} label={SECTIONS.pricing.label} />
        <SectionTitle>{SECTIONS.pricing.title}</SectionTitle>
        <Lede>{SECTIONS.pricing.lede}</Lede>
        <ul className="mt-12 grid gap-5 lg:grid-cols-3">
          {PLANS.map((plan) => {
            return (
              <motion.li
                key={plan.id}
                variants={wipe(40)}
                whileHover={{ y: -10 }}
                transition={{ duration: 0.5, ease: EASE }}
                className={`relative flex flex-col gap-8 rounded-[40px] p-8 sm:p-10 ${
                  plan.featured ? "bg-ink text-sky" : "glass text-ink"
                }`}
              >
                {plan.featured && (
                  <span className="absolute right-8 top-8 rounded-full bg-sky/20 px-3 py-1 font-sans text-[.65rem] uppercase tracking-[.16em]">
                    La normal
                  </span>
                )}
                <div>
                  <h3 className="font-display text-xl font-semibold uppercase tracking-[-.03em]">{plan.name}</h3>
                  <p className={`mt-3 font-sans text-sm ${plan.featured ? "opacity-70" : "text-ink/60"}`}>{plan.tagline}</p>
                </div>
                <code
                  className={`block overflow-x-auto rounded-2xl px-4 py-3 font-mono text-[.8rem] leading-relaxed ${
                    plan.featured ? "bg-sky/15 text-sky" : "bg-ink/5 text-ink/80"
                  }`}
                >
                  {plan.how}
                </code>
                <ul className="flex flex-1 flex-col gap-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 font-sans text-sm leading-relaxed">
                      <i className={`mt-2 h-1 w-1 shrink-0 rounded-full ${plan.featured ? "bg-sky/70" : "bg-ink/40"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Magnetic strength={0.22}>
                  <a
                    href={plan.href}
                    target="_blank"
                    rel="noreferrer"
                    className={`group flex items-center justify-between gap-4 rounded-full px-6 py-4 font-sans text-sm font-semibold transition-opacity hover:opacity-85 ${
                      plan.featured ? "bg-sky text-ink" : "bg-ink text-sky"
                    }`}
                  >
                    <span>{plan.cta}</span>
                    <ArrowRightIcon className="h-5 w-5 transition-transform duration-500 ease-out group-hover:translate-x-1" />
                  </a>
                </Magnetic>
              </motion.li>
            );
          })}
        </ul>
      </RevealGroup>
    </Section>
  );
}

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq">
      <Drift className="-right-[4%] top-[20%] h-[22rem] w-[22rem]" distance={80} />
      <div className="grid gap-12 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:gap-20">
        <RevealGroup className="lg:sticky lg:top-28 lg:self-start">
          <Eyebrow index={SECTIONS.faq.index} label={SECTIONS.faq.label} />
          <SectionTitle>{SECTIONS.faq.title}</SectionTitle>
        </RevealGroup>
        <RevealGroup>
          <ul>
            {FAQ.map((item, i) => {
              const isOpen = openIndex === i;
              return (
                <li key={item.q} className="group border-b border-ink/12 first:border-t">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    className="flex w-full items-start justify-between gap-8 py-6 text-left"
                  >
                    <span className="mt-1.5 font-sans text-xs tabular-nums text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                    <span className="flex-1 font-display text-lg font-semibold uppercase leading-tight tracking-[-.02em] text-ink transition-transform duration-500 ease-out group-hover:translate-x-2 sm:text-xl">
                      {item.q}
                    </span>
                    <span className="relative mt-2 block h-3 w-3 shrink-0">
                      <i className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-ink" />
                      <motion.i
                        animate={{ scaleY: isOpen ? 0 : 1 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-ink"
                      />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[62ch] pb-7 pl-10 font-sans text-[.95rem] leading-[1.65] text-ink/70">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </RevealGroup>
      </div>
    </Section>
  );
}

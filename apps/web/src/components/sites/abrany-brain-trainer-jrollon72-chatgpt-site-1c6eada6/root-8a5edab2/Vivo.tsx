"use client";

/**
 * El revisor de verdad, corriendo en el navegador.
 *
 * El motor es el mismo código que la CLI (`ia-linter-es/web`) y el Rule Pack es el mismo
 * archivo. El texto no sale de aquí: se analiza en tu máquina y no hay ninguna petición.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { FileResult, ProfileName, RulePack, RunnerContext } from "ia-linter-es/web";
import { EASE, Reveal, RevealGroup } from "../shared/motion-kit";
import { EJEMPLOS, PERFILES, SECTIONS, VIVO } from "./content";
import { Eyebrow, Lede, Section, SectionTitle } from "./primitives";

type Motor = typeof import("ia-linter-es/web");
type Estado = "inicial" | "cargando" | "listo" | "error";

const NIVEL: Record<string, { label: string; punto: string; texto: string }> = {
  error: { label: "error", punto: "bg-[#c2410c]", texto: "text-[#c2410c]" },
  warning: { label: "aviso", punto: "bg-[#b45309]", texto: "text-[#b45309]" },
  info: { label: "nota", punto: "bg-ink/40", texto: "text-ink/55" },
};

export function Vivo() {
  const [texto, setTexto] = useState(EJEMPLOS.generado);
  const [perfil, setPerfil] = useState<ProfileName>("chat");
  const [estado, setEstado] = useState<Estado>("inicial");
  const [resultado, setResultado] = useState<FileResult | null>(null);
  const motorRef = useRef<{ web: Motor; pack: RulePack } | null>(null);
  const ctxRef = useRef<Map<ProfileName, RunnerContext>>(new Map());
  const seccionRef = useRef<HTMLDivElement>(null);

  // El motor son 300 kB: se trae la primera vez que la sección se acerca a la pantalla.
  const cargar = useCallback(async () => {
    if (motorRef.current || estado === "cargando") return;
    setEstado("cargando");
    try {
      const [web, packMod] = await Promise.all([import("ia-linter-es/web"), import("ia-linter-es/rulepack.json")]);
      const pack = ((packMod as { default?: RulePack }).default ?? packMod) as RulePack;
      motorRef.current = { web, pack };
      setEstado("listo");
    } catch {
      setEstado("error");
    }
  }, [estado]);

  useEffect(() => {
    const el = seccionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          void cargar();
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [cargar]);

  const analizar = useCallback(
    (valor: string, p: ProfileName) => {
      const motor = motorRef.current;
      if (!motor) return;
      let ctx = ctxRef.current.get(p);
      if (!ctx) {
        ctx = motor.web.createWebContext({ pack: motor.pack, profile: p });
        ctxRef.current.set(p, ctx);
      }
      setResultado(motor.web.lintText(valor, ctx, { relPath: "texto.md" }));
    },
    [],
  );

  useEffect(() => {
    if (estado !== "listo") return;
    const id = setTimeout(() => analizar(texto, perfil), 220);
    return () => clearTimeout(id);
  }, [texto, perfil, estado, analizar]);

  const visibles = useMemo(() => (resultado?.findings ?? []).filter((f) => !f.suppressed), [resultado]);
  const cuenta = useMemo(() => {
    const c = { error: 0, warning: 0, info: 0 };
    for (const f of visibles) c[f.level] += 1;
    return c;
  }, [visibles]);

  const indice = resultado?.score.index ?? null;
  const faltan = resultado ? Math.max(0, resultado.score.minWords - resultado.score.eligibleWords) : 0;

  return (
    <Section id="vivo">
      <div ref={seccionRef}>
        <RevealGroup>
          <Eyebrow index={SECTIONS.vivo.index} label={SECTIONS.vivo.label} />
          <SectionTitle>{SECTIONS.vivo.title}</SectionTitle>
          <Lede>{SECTIONS.vivo.lede}</Lede>

          <Reveal className="mt-10 flex flex-wrap items-center gap-2">
            {PERFILES.map((p) => (
              <button
                key={p.id}
                onClick={() => setPerfil(p.id)}
                aria-pressed={perfil === p.id}
                className={`relative rounded-full px-4 py-2 font-sans text-xs transition-colors ${
                  perfil === p.id ? "text-ink" : "text-ink/50 hover:text-ink/75"
                }`}
              >
                {perfil === p.id && (
                  <motion.span
                    layoutId="perfil-pill"
                    className="absolute inset-0 rounded-full bg-white/70"
                    transition={{ duration: 0.35, ease: EASE }}
                  />
                )}
                <span className="relative">{p.label}</span>
              </button>
            ))}
          </Reveal>

          <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,.85fr)]">
            <motion.div className="glass flex h-full flex-col gap-4 rounded-[32px] p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-sans text-xs uppercase tracking-[.18em] text-ink/50">{VIVO.editorLabel}</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setTexto(EJEMPLOS.generado)}
                    className="rounded-full bg-white/50 px-4 py-2 font-sans text-xs text-ink transition-colors hover:bg-white/75"
                  >
                    {VIVO.botonGenerado}
                  </button>
                  <button
                    onClick={() => setTexto(EJEMPLOS.humano)}
                    className="rounded-full bg-white/50 px-4 py-2 font-sans text-xs text-ink transition-colors hover:bg-white/75"
                  >
                    {VIVO.botonHumano}
                  </button>
                  <button
                    onClick={() => setTexto("")}
                    className="rounded-full px-4 py-2 font-sans text-xs text-ink/55 transition-colors hover:text-ink"
                  >
                    {VIVO.botonBorrar}
                  </button>
                </div>
              </div>
              <textarea
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onFocus={() => void cargar()}
                spellCheck={false}
                aria-label={VIVO.editorLabel}
                placeholder={VIVO.placeholder}
                className="min-h-[19rem] w-full flex-1 resize-y rounded-2xl bg-white/45 p-5 font-sans text-[.95rem] leading-[1.65] text-ink placeholder:text-ink/35 focus:bg-white/60"
              />
              <p className="font-sans text-xs leading-relaxed text-ink/50">{VIVO.nota}</p>
            </motion.div>

            <div className="flex flex-col gap-5">
              <div className="glass flex flex-col gap-5 rounded-[32px] p-6 sm:p-8">
                <span className="font-sans text-xs uppercase tracking-[.18em] text-ink/50">{VIVO.indiceLabel}</span>
                <div className="flex items-end gap-3">
                  <AnimatePresence mode="popLayout">
                    <motion.span
                      key={`${indice}-${estado}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25, ease: EASE }}
                      className="font-display text-6xl font-semibold leading-none tracking-[-.03em] tabular-nums text-ink"
                    >
                      {estado !== "listo" ? "··" : indice === null ? "—" : indice}
                    </motion.span>
                  </AnimatePresence>
                  <span className="pb-1 font-sans text-sm text-ink/50">{VIVO.deCien}</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink/10">
                  <motion.i
                    className="block h-full rounded-full bg-ink/70"
                    animate={{ width: `${indice === null ? 0 : Math.min(100, indice)}%` }}
                    transition={{ duration: 0.5, ease: EASE }}
                  />
                </div>
                <p role="status" aria-live="polite" className="font-sans text-xs leading-relaxed text-ink/55">
                  {estado === "cargando" && VIVO.cargando}
                  {estado === "error" && VIVO.error}
                  {estado === "listo" && indice === null && `${VIVO.pocasPalabras} ${faltan}.`}
                  {estado === "listo" && indice !== null && resultado && (
                    <>
                      {cuenta.error} {cuenta.error === 1 ? "error" : "errores"}, {cuenta.warning}{" "}
                      {cuenta.warning === 1 ? "aviso" : "avisos"}, {cuenta.info}{" "}
                      {cuenta.info === 1 ? "nota" : "notas"}. {VIVO.analizadoEn} {resultado.durationMs} ms.
                    </>
                  )}
                </p>
              </div>

              <div className="glass flex max-h-[32rem] flex-col gap-3 overflow-y-auto rounded-[32px] p-6 sm:p-8">
                <span className="font-sans text-xs uppercase tracking-[.18em] text-ink/50">{VIVO.hallazgosLabel}</span>
                {estado === "listo" && visibles.length === 0 && (
                  <p className="font-sans text-sm text-ink/60">{texto.trim() ? VIVO.sinHallazgos : VIVO.sinTexto}</p>
                )}
                <ul className="flex flex-col">
                  {visibles.map((f, i) => {
                    const n = NIVEL[f.level] ?? NIVEL.info;
                    return (
                      <li
                        key={`${f.fingerprint}-${i}`}
                        className="flex gap-3 border-b border-ink/10 py-3 last:border-0"
                      >
                        <i className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n!.punto}`} />
                        <div className="min-w-0">
                          <p className="font-sans text-sm leading-snug text-ink">{f.message}</p>
                          <p className="mt-1 font-mono text-[.7rem] text-ink/45">
                            {f.range.start.line}:{f.range.start.column} · {f.rule}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </RevealGroup>
      </div>
    </Section>
  );
}

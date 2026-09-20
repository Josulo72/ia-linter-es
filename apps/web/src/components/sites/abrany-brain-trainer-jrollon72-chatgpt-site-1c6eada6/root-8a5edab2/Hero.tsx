"use client";

/* eslint-disable @next/next/no-img-element -- stage layers are absolutely positioned raw images, as in the original */

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { motion } from "motion/react";
import { bloom, EASE, fade, Magnetic, maskWord, rise, stagger, useHeroParallax } from "../shared/motion-kit";
import {
  AVATARS,
  box,
  HERO,
  IMG,
  LAYOUT_DESKTOP,
  LAYOUT_MOBILE,
  NAV,
  PKG,
  STAGE_DESKTOP,
  STAGE_MOBILE,
  stageVars,
  textTop,
  u,
  VIDEO,
} from "./content";
import { ArrowRightIcon, BrainIcon, CupIcon, FlameIcon, SoundIcon, TrendIcon } from "./icons";
import { MenuButton, RollText } from "./primitives";

const noopSubscribe = () => () => {};

function useMediaQuery(query: string, initial = false) {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );
  const matches = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => initial,
  );
  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  return { matches, mounted };
}

type Mode = "video" | "static";

export function Hero({ active }: { active: string }) {
  const { matches: desktop, mounted } = useMediaQuery("(min-width: 1024px)", true);
  const stage = desktop ? STAGE_DESKTOP : STAGE_MOBILE;
  const L = desktop ? LAYOUT_DESKTOP : LAYOUT_MOBILE;
  const { sectionRef, stageRef, y } = useHeroParallax(stage.w);
  const [mode, setMode] = useState<Mode>("video");
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = mode === "video";

  useEffect(() => {
    if (mode === "video") videoRef.current?.play().catch(() => undefined);
  }, [mode]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  const showFilm = () => {
    setMode("video");
    videoRef.current?.play().catch(() => undefined);
  };
  const showStill = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setMode("static");
  };

  return (
    <motion.section
      ref={sectionRef}
      id="home"
      className="relative flex h-svh w-full items-center justify-center overflow-hidden transition-colors duration-1000"
      style={{ backgroundColor: isVideo ? "var(--color-sky-lit)" : "var(--color-sky)" }}
      variants={stagger()}
      initial="hidden"
      animate={mounted ? "show" : "hidden"}
    >
      <div ref={stageRef} className="stage overflow-hidden" style={stageVars(stage)}>
        {desktop && L.arc && (
          <motion.div variants={bloom} style={{ y: y.far }} className="pointer-events-none absolute inset-0" aria-hidden>
            <div style={box(L.arc.x, L.arc.y, L.arc.w, L.arc.h)}>
              <div className="absolute" style={{ inset: "-66.45% -24.74%" }}>
                <img src={IMG.arc} alt="" className="block h-full w-full max-w-none" />
              </div>
            </div>
            <motion.p
              variants={fade}
              className="absolute -translate-x-1/2 whitespace-nowrap text-center font-wide uppercase"
              style={{
                left: u(253.54),
                top: u(585),
                fontSize: u(300),
                lineHeight: 1,
                letterSpacing: "-0.06em",
                filter: `blur(${u(20.2)})`,
                opacity: 0.5,
                backgroundImage: "linear-gradient(180deg, rgba(228,240,255,0.2), rgba(197,215,240,0.2))",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {HERO.ghost}
            </motion.p>
          </motion.div>
        )}

        <motion.div variants={bloom} style={{ y: y.mid }} className="pointer-events-none absolute inset-0" aria-hidden>
          <motion.img
            src={IMG.glow}
            alt=""
            animate={{ opacity: isVideo ? 1 : 0 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute max-w-none object-bottom"
            style={{ ...box(L.glow.x, L.glow.y, L.glow.w, L.glow.h), filter: `blur(${u(L.glow.blur)})` }}
          />
          <img src={IMG.ringOuter} alt="" className="absolute block max-w-none" style={box(L.center.x, L.center.y, L.ringOuter)} />
          <div className="absolute" style={box(L.center.x, L.center.y, L.ringInner)}>
            <div className="absolute" style={{ inset: "-1.02%" }}>
              <motion.img
                src={IMG.ringInner}
                alt=""
                animate={{ rotate: playing ? 360 : 0 }}
                transition={playing ? { duration: 140, ease: "linear", repeat: Infinity } : { duration: 1.2, ease: EASE }}
                className="block h-full w-full max-w-none"
              />
            </div>
          </div>
        </motion.div>

        <motion.div variants={bloom} style={{ y: y.brain }} className="pointer-events-none absolute inset-0">
          <motion.img
            src={IMG.brain}
            alt="Representación anatómica de un cerebro humano"
            animate={{ opacity: isVideo ? 0 : 1, scale: isVideo ? 1.03 : 1 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute max-w-none object-bottom"
            style={{ ...box(L.brain.x, L.brain.y, L.brain.w, L.brain.h), rotate: 15 }}
          />
          <motion.div
            animate={{ opacity: isVideo ? 1 : 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="absolute overflow-hidden rounded-full"
            style={{
              ...box(L.center.x, L.center.y, L.ringInner),
              maskImage: "radial-gradient(circle at 50% 50%, #000 56%, transparent 84%)",
              WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 56%, transparent 84%)",
            }}
          >
            <video
              ref={videoRef}
              src={VIDEO.film}
              poster={VIDEO.poster}
              autoPlay
              muted={muted}
              loop
              playsInline
              preload="auto"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              className="h-full w-full object-cover"
            />
          </motion.div>
        </motion.div>

        {desktop ? <HeroNavDesktop active={active} /> : <HeroNavMobile />}

        <motion.div style={{ y: y.near }} className="pointer-events-none absolute inset-0">
          <HeroCopy desktop={desktop} />
        </motion.div>

        <motion.div style={{ y: y.front }} className="pointer-events-none absolute inset-0">
          <LearnersCard desktop={desktop} />
          <SessionsCard desktop={desktop} />
          <InsightCard desktop={desktop} />
          {desktop && <HeroBadge mode={mode} showFilm={showFilm} showStill={showStill} />}
        </motion.div>

        <motion.button
          variants={bloom}
          onClick={() => setMuted((m) => !m)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.35, ease: EASE }}
          aria-label={muted ? "Activar sonido del vídeo" : "Silenciar el vídeo"}
          title={muted ? "Activar sonido del vídeo" : "Silenciar el vídeo"}
          className="absolute grid place-items-center rounded-full border border-ink/20 text-ink transition-colors hover:bg-white/45"
          style={{ left: u(L.sound.x), top: u(L.sound.y), width: u(L.sound.size), height: u(L.sound.size) }}
        >
          <SoundIcon className="h-1/2 w-1/2" />
        </motion.button>
      </div>
    </motion.section>
  );
}

function HeroNavDesktop({ active }: { active: string }) {
  return (
    <>
      <motion.a
        variants={rise}
        href="#home"
        aria-label={`${PKG.name} - inicio`}
        className="absolute flex items-center"
        style={{ left: u(38), top: u(31.8), gap: u(3.5) }}
      >
        <img src={IMG.logoMark} alt="" style={{ width: u(13.063), height: u(13.063) }} />
        <span className="font-wide text-ink" style={{ fontSize: u(10), lineHeight: 1, letterSpacing: "-0.06em" }}>
          {PKG.name}
        </span>
      </motion.a>
      <motion.nav
        variants={rise}
        className="absolute left-1/2 flex -translate-x-1/2"
        style={{ top: textTop(34.4, 12), gap: u(95) }}
      >
        {NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            aria-current={active === item.id ? "page" : undefined}
            className={`font-display capitalize text-ink transition-opacity duration-300 hover:opacity-100 ${
              active === item.id ? "opacity-100" : "opacity-40"
            }`}
            style={{ fontSize: u(12), lineHeight: 1 }}
          >
            {item.label}
          </a>
        ))}
      </motion.nav>
      <motion.div
        variants={rise}
        className="absolute flex items-center"
        style={{ left: u(1265.62), top: textTop(34.4, 12), gap: u(38) }}
      >
        <a
          href="#contact"
          className="font-display font-medium uppercase text-ink hover:opacity-60"
          style={{ fontSize: u(12), lineHeight: 1 }}
        >
          Contacto
        </a>
        <MenuButton width={u(22.756)} gap={u(4.559)} />
      </motion.div>
      <i aria-hidden className="absolute w-px bg-ink/30" style={{ left: u(513.55), top: 0, height: u(18.024) }} />
    </>
  );
}

function HeroNavMobile() {
  return (
    <>
      <motion.a
        variants={rise}
        href="#home"
        aria-label={`${PKG.name} - inicio`}
        className="absolute"
        style={{ left: u(20), top: u(41.43), width: u(32.194), height: u(32.511) }}
      >
        <img src={IMG.logoMark} alt="" className="h-full w-full object-contain" />
      </motion.a>
      <motion.div
        variants={rise}
        className="absolute flex items-center"
        style={{ left: u(283.24), top: textTop(53.578, 12), gap: u(38) }}
      >
        <a
          href="#contact"
          className="font-display font-medium uppercase text-ink hover:opacity-60"
          style={{ fontSize: u(12), lineHeight: 1 }}
        >
          Contacto
        </a>
        <MenuButton width={u(22.756)} gap={u(4.559)} />
      </motion.div>
    </>
  );
}

const HEADLINE_INDENT = ["0em", "0em", "2.18em", "1.01em"];

function HeroCopy({ desktop }: { desktop: boolean }) {
  const size = desktop ? 72 : 56;
  const top = desktop ? textTop(167.47, 72, 0.873) : textTop(129.33, 56, 0.873);
  const left = desktop ? 34.32 : 20;
  const lede = desktop
    ? { left: 111.52, top: 442.03, size: 16, width: 258 }
    : { left: 76.72, top: 347, size: 14, width: 237.963 };
  const cta = desktop ? { left: 111.52, top: 559.01 } : { left: 76.72, top: 429.16 };

  return (
    <>
      <motion.h1
        variants={stagger(0.09, 0)}
        className="absolute font-display font-semibold uppercase text-ink"
        style={{ left: u(left), top, fontSize: u(size), lineHeight: 0.873, letterSpacing: "-0.03em" }}
      >
        {HERO.headline.map((word, i) => (
          <span key={word} className="block overflow-hidden" style={{ marginLeft: HEADLINE_INDENT[i] }}>
            <motion.span
              variants={maskWord}
              className="block whitespace-nowrap will-change-transform"
              style={
                i === HERO.accent
                  ? {
                      backgroundImage: "linear-gradient(180deg, #9badc7 89.759%, rgba(68,77,142,0) 132.46%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }
                  : undefined
              }
            >
              {word}
            </motion.span>
          </span>
        ))}
      </motion.h1>
      <motion.p
        variants={rise}
        className="absolute font-sans font-normal text-ink"
        style={{ left: u(lede.left), top: u(lede.top), fontSize: u(lede.size), lineHeight: 1.2, width: u(lede.width) }}
      >
        {HERO.lede}
      </motion.p>
      <div className="pointer-events-auto absolute" style={{ left: u(cta.left), top: u(cta.top) }}>
        <Magnetic strength={0.28}>
          <motion.a
            variants={rise}
            href="#pricing"
            className="group inline-flex items-center justify-center bg-white/62 transition-colors hover:bg-white/80"
            style={{
              gap: u(20),
              paddingLeft: u(4),
              paddingRight: u(32),
              paddingTop: u(4),
              paddingBottom: u(4),
              borderRadius: u(999),
            }}
          >
            <span className="grid rounded-full bg-orb text-white" style={{ width: u(72), height: u(72), placeItems: "center" }}>
              <BrainIcon style={{ width: u(26), height: u(26) }} />
            </span>
            <span className="flex items-center" style={{ gap: u(12) }}>
              <span
                className="font-sans font-semibold text-ink opacity-90"
                style={{ fontSize: u(16), lineHeight: 1, letterSpacing: "-0.02em" }}
              >
                <RollText>{HERO.cta}</RollText>
              </span>
              <ArrowRightIcon
                className="transition-transform duration-500 ease-out group-hover:translate-x-1"
                style={{ width: u(18), height: u(18) }}
              />
            </span>
          </motion.a>
        </Magnetic>
      </div>
    </>
  );
}

function LearnersCard({ desktop }: { desktop: boolean }) {
  const k = desktop ? 1 : 0.7468;
  const c = desktop
    ? { w: 321, h: 73, r: 24, faces: 5, av: 33.243, avLeft: 19, tx: 177, left: 970, top: 174.97 }
    : { w: 193.098, h: 53.356, r: 17.923, faces: 3, av: 24.825, avLeft: 14.73, tx: 87.66, left: 226, top: 692 };
  const s = (n: number) => u(n * k);

  return (
    <motion.div
      variants={rise}
      className="glass pointer-events-auto absolute"
      style={{ left: u(c.left), top: u(c.top), width: u(c.w), height: u(c.h), borderRadius: u(c.r) }}
    >
      <div className="absolute isolate flex -translate-y-1/2 items-start" style={{ left: u(c.avLeft), top: "50%" }}>
        {AVATARS.slice(0, c.faces).map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className="rounded-full"
            style={{
              width: u(c.av),
              height: u(c.av),
              marginRight: i === c.faces - 1 ? 0 : u(-c.av * 0.2105),
              zIndex: c.faces - i,
            }}
          />
        ))}
      </div>
      <div
        className="absolute flex -translate-y-1/2 flex-col items-start text-white"
        style={{ left: u(c.tx), top: "50%", gap: s(10) }}
      >
        <span className="font-sans font-semibold" style={{ fontSize: s(21), lineHeight: 1, letterSpacing: "-0.02em" }}>
          {HERO.learners.value}
        </span>
        <span className="font-sans font-light opacity-67" style={{ fontSize: s(18), lineHeight: 1, letterSpacing: "-0.02em" }}>
          {HERO.learners.label}
        </span>
      </div>
    </motion.div>
  );
}

function SessionsCard({ desktop }: { desktop: boolean }) {
  const k = desktop ? 1 : 0.8375;
  const c = desktop ? { w: 231, h: 267, left: 1090, top: 328.72 } : { w: 193.48, h: 223.633, left: 20, top: 692 };
  const s = (n: number) => u(n * k);

  const gauge = (width: number, offsetX: number, opacity: number, src: string) => (
    <div className="absolute overflow-hidden" style={{ left: s(8.5), top: s(22.55), width: s(width), height: s(98.904) }}>
      <img
        src={src}
        alt=""
        className="absolute block max-w-none -translate-x-1/2 -translate-y-1/2"
        style={{
          left: `calc(50% + ${s(offsetX)})`,
          top: `calc(50% + ${s(58.03)})`,
          width: s(215.009),
          height: s(215.009),
          opacity,
        }}
      />
    </div>
  );

  const tile = (side: "left" | "right") => {
    const right = side === "right";
    return (
      <div
        className="glass-tile absolute"
        style={{
          bottom: s(6),
          [right ? "right" : "left"]: s(6),
          width: s(106.5),
          height: s(115),
          borderRadius: right ? `${s(12)} ${s(12)} ${s(34)} ${s(12)}` : `${s(12)} ${s(12)} ${s(12)} ${s(34)}`,
        }}
      >
        <div className="absolute text-white" style={{ left: s(15.03), top: s(11), width: s(26), height: s(26) }}>
          {right ? <FlameIcon className="h-full w-full" /> : <CupIcon className="h-full w-full" />}
        </div>
        <span
          className="absolute font-sans font-semibold text-white"
          style={{ left: s(15.03), top: textTop(65 * k, 21 * k), fontSize: s(21) }}
        >
          {right ? HERO.avgScore.value : HERO.dataPoints.value}
        </span>
        <span
          className="absolute font-sans font-light text-white opacity-67"
          style={{ left: s(15.03), top: textTop(86.64 * k, 14 * k), fontSize: s(14) }}
        >
          {right ? HERO.avgScore.label : HERO.dataPoints.label}
        </span>
        {right && (
          <TrendIcon
            className="absolute text-trend"
            style={{ left: s(60.03), top: s(67), width: s(12), height: s(12) }}
          />
        )}
      </div>
    );
  };

  return (
    <motion.div
      variants={rise}
      className="glass pointer-events-auto absolute overflow-hidden"
      style={{ left: u(c.left), top: u(c.top), width: u(c.w), height: u(c.h), borderRadius: s(40) }}
    >
      {gauge(215.009, -0.54, 0.1, IMG.gaugeTrack)}
      {gauge(116.105, 48.91, 1, IMG.gaugeFill)}
      <span
        className="absolute left-1/2 -translate-x-1/2 font-display font-normal uppercase text-white"
        style={{ top: textTop(71 * k, 32 * k), fontSize: s(32), letterSpacing: "-0.03em" }}
      >
        {HERO.sessions.value}
      </span>
      <span
        className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-sans font-light text-white opacity-67"
        style={{ top: textTop(101 * k, 18 * k), fontSize: s(18) }}
      >
        {HERO.sessions.label}
      </span>
      {tile("left")}
      {tile("right")}
    </motion.div>
  );
}

function InsightCard({ desktop }: { desktop: boolean }) {
  const k = desktop ? 1 : 0.8375;
  const c = desktop ? { w: 231, h: 176, left: 545, top: 476.97 } : { w: 193, h: 156, left: 226, top: 757 };
  const s = (n: number) => u(n * k);

  return (
    <motion.a
      href="#vivo"
      aria-label={`${HERO.insight.kicker} ${HERO.insight.title}: probar el revisor`}
      variants={rise}
      className="glass pointer-events-auto absolute block overflow-hidden transition-transform duration-500 ease-out hover:scale-[1.02]"
      style={{ left: u(c.left), top: u(c.top), width: u(c.w), height: u(c.h), borderRadius: s(40) }}
    >
      <img
        src={IMG.neuralThumb}
        alt=""
        className="absolute max-w-none object-cover"
        style={{ left: s(-3.07), top: s(21.56), width: s(124.603), height: s(69.832) }}
      />
      <span
        className="absolute font-sans font-light text-white opacity-67"
        style={{ left: s(121.53), top: textTop(37.49 * k, 18 * k), fontSize: s(18) }}
      >
        {HERO.insight.kicker}
      </span>
      <span
        className="absolute font-sans font-semibold text-white"
        style={{ left: s(121.53), top: textTop(59.12 * k, 21 * k), fontSize: s(21) }}
      >
        {HERO.insight.title}
      </span>
      <img
        src={IMG.chartLineA}
        alt=""
        className="absolute max-w-none"
        style={{ left: s(-8.06), top: s(98.07), width: s(247.111), height: s(103.642) }}
      />
      <img
        src={IMG.chartLineB}
        alt=""
        className="absolute max-w-none"
        style={{ left: s(-33.53), top: s(97.11), width: s(342.769), height: s(97.205) }}
      />
      <i className="absolute rounded-full bg-white" style={{ left: s(72.45), top: s(100.8), width: s(5.463), height: s(5.463) }} />
      <i className="absolute rounded-full bg-white" style={{ left: s(138.4), top: s(120.78), width: s(5.463), height: s(5.463) }} />
    </motion.a>
  );
}

function HeroBadge({ mode, showFilm, showStill }: { mode: Mode; showFilm: () => void; showStill: () => void }) {
  return (
    <>
      <motion.img
        variants={rise}
        src={IMG.brainBadge}
        alt=""
        className="absolute block object-contain"
        style={{ left: u(1306.26), top: u(643.03), width: u(107.371), height: u(107.371) }}
      />
      <motion.p
        variants={rise}
        className="absolute font-display font-semibold uppercase text-ink"
        style={{ left: u(1245.2), top: textTop(704.97, 24), fontSize: u(24), lineHeight: 1, letterSpacing: "-0.03em" }}
      >
        {HERO.badge.map((w) => (
          <span key={w}>
            {w}
            <br />
          </span>
        ))}
      </motion.p>
      <motion.div
        variants={rise}
        className="pointer-events-auto absolute flex items-end"
        style={{ left: u(34.32), top: u(750.03), gap: u(20) }}
      >
        <button
          onClick={showStill}
          aria-pressed={mode === "static"}
          className={`font-display font-semibold uppercase text-ink transition-opacity duration-500 ${
            mode === "static" ? "opacity-100" : "opacity-40 hover:opacity-70"
          }`}
          style={{ fontSize: u(14) }}
        >
          01
        </button>
        <i aria-hidden className="bg-ink" style={{ width: u(41.777), height: 1, marginBottom: u(4) }} />
        <button
          onClick={showFilm}
          aria-pressed={mode === "video"}
          className={`font-display font-semibold uppercase text-ink transition-opacity duration-500 ${
            mode === "video" ? "opacity-100" : "opacity-40 hover:opacity-70"
          }`}
          style={{ fontSize: u(28) }}
        >
          02
        </button>
      </motion.div>
    </>
  );
}

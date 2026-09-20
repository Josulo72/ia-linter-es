"use client";

import { Marquee, MenuProvider, MotionProvider, SmoothScroll, useActiveSection } from "../shared/motion-kit";
import { MARQUEE_DOMAINS, MARQUEE_VALUES, SECTION_IDS } from "./content";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Courses, Faq, Limites, Method, Pricing, Trainers } from "./Sections";
import { Vivo } from "./Vivo";
import { MenuOverlay, ScrollProgress, StickyHeader } from "./SiteChrome";

function Page() {
  const active = useActiveSection(SECTION_IDS);
  return (
    <MenuProvider>
      <SmoothScroll />
      <ScrollProgress />
      <StickyHeader active={active} />
      <MenuOverlay />
      <main>
        <Hero active={active} />
        <Courses />
        <Marquee words={MARQUEE_DOMAINS} />
        <Vivo />
        <Method />
        <Trainers />
        <Limites />
        <Marquee words={MARQUEE_VALUES} baseVelocity={1.8} />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </MenuProvider>
  );
}

export function AbranyPage() {
  return (
    <MotionProvider>
      <Page />
    </MotionProvider>
  );
}

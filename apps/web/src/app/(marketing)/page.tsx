import { ClosingCta } from "@/components/marketing/ClosingCta";
import { Faq } from "@/components/marketing/Faq";
import { FeatureBento } from "@/components/marketing/FeatureBento";
import { Hero } from "@/components/marketing/Hero";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { TrustedStrip } from "@/components/marketing/TrustedStrip";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustedStrip />
      <FeatureBento />
      <HowItWorks />
      <Faq />
      <ClosingCta />
    </>
  );
}

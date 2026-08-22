import SEO from "../../components/SEO/SEO";
import { Navbar } from "../../components/landing/Navbar";
import { Hero } from "../../components/landing/Hero";
// CapabilityStrip is intentionally not composed here — see the note in <main> below.
import { SyllabusSection } from "../../components/landing/SyllabusSection";
import { PracticeSection } from "../../components/landing/PracticeSection";
import { ProgressSection } from "../../components/landing/ProgressSection";
import { HowItWorks } from "../../components/landing/HowItWorks";
import { FeatureGrid } from "../../components/landing/FeatureGrid";
import { WhyUsSection } from "../../components/landing/WhyUsSection";
import { ContactSection } from "../../components/landing/ContactSection";
import { FaqSection } from "../../components/landing/FaqSection";
import { FinalCta } from "../../components/landing/FinalCta";
import { Footer } from "../../components/landing/Footer";

/** Public landing page — a thin composition of the sections in components/landing. */
const LandingPage = () => (
  <>
    <SEO
      title="Dev Classes - Master the art of Accounting with us."
      description="Dev Classes is a platform for Commerce students to learn and practice Accounting, Economics, and Business Studies. We provide chapter-wise MCQs, timed tests, and instant scoring to help you master the subject."
      keywords="Commerce MCQs, Accountancy MCQ practice, CBSE Commerce, GSEB Commerce, 11th 12th Commerce, online test, Dev Classes"
    />

    {/* `dc-public` scopes the Tailwind reset and design tokens to the public experience. */}
    <div className="dc-public min-h-screen bg-background">
      <Navbar />
      <main>
        <Hero />
        {/* CapabilityStrip removed: its items duplicate the FeatureGrid section below. */}
        <SyllabusSection />
        <PracticeSection />
        <ProgressSection />
        <HowItWorks />
        <FeatureGrid />
        <WhyUsSection />
        <FaqSection />
        <ContactSection />
        <FinalCta />
      </main>
      <Footer />
    </div>
  </>
);

export default LandingPage;

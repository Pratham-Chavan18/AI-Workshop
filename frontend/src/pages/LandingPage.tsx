import React from 'react';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import HeroSection from '@/components/landing/hero-section';
import OutcomeSection from '@/components/landing/outcome-section';
import WorkshopTimeline from '@/components/landing/workshop-timeline';
import CampusLeaderboardPreview from '@/components/landing/campus-leaderboard-preview';
import ReferralSection from '@/components/landing/referral-section';
import FinalCTA from '@/components/landing/final-cta';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink antialiased selection:bg-primary/20 selection:text-primary">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <OutcomeSection />
        <WorkshopTimeline />
        <CampusLeaderboardPreview />
        <ReferralSection />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
};

export default LandingPage;

import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import RegistrationForm from '@/components/registration/registration-form';
import { Sticker } from '@/components/slush/sticker';
import { Trophy, Sparkles, ArrowUpRight } from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  useEffect(() => {
    document.title = 'Register Free | AI Workshop | NxtWave';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slush-sky text-black antialiased">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="relative z-10 w-full max-w-lg mx-auto">
          {/* Slush Elevated Card with 1px black border */}
          <div className="slush-card-elevated bg-white border border-black overflow-hidden">
            {/* Header */}
            <div className="bg-slush-lavender border-b border-black p-6 sm:p-8 text-center relative">
              <div className="flex justify-center mb-3">
                <Sticker
                  color="voltage"
                  icon={<Sparkles className="w-3.5 h-3.5" />}
                  label="FREE ONLINE WORKSHOP"
                  size="sm"
                />
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold font-display tracking-tight text-black uppercase leading-none">
                Reserve Your Seat
              </h1>
              <p className="text-xs sm:text-sm mt-2 text-neutral-800 font-medium">
                Build Your First AI Project in 60 Minutes • For Final-Year Engineers
              </p>

              {refCode && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-slush-sunburst text-black border border-black text-xs font-bold">
                  <Trophy className="w-3.5 h-3.5 text-black" />
                  <span>Referred by classmate ({refCode})!</span>
                </div>
              )}
            </div>

            {/* Form Body */}
            <div className="p-6 sm:p-8 bg-white">
              <RegistrationForm />
            </div>
          </div>

          {/* Quick link to leaderboard */}
          <div className="mt-6 text-center text-xs sm:text-sm font-semibold text-neutral-800 flex items-center justify-center gap-1">
            <span>Want to see how your campus is ranking?</span>
            <Link to="/leaderboard" className="underline font-bold text-black flex items-center hover:opacity-75">
              <span>View Leaderboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default RegistrationPage;

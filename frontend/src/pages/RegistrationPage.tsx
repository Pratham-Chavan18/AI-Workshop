import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SiteHeader from '@/components/layout/site-header';
import SiteFooter from '@/components/layout/site-footer';
import RegistrationForm from '@/components/registration/registration-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { Sparkles, Trophy } from 'lucide-react';

export const RegistrationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get('ref');

  useEffect(() => {
    document.title = 'Register Free | AI 60×500 Workshop | NxtWave';
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-ink antialiased">
      <SiteHeader />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <AuroraBackground className="absolute inset-0 pointer-events-none opacity-60" />

        <div className="relative z-10 w-full max-w-lg mx-auto">
          <Card className="shadow-lg border-border/80 bg-card/95 backdrop-blur-md overflow-hidden">
            <CardHeader className="text-center pb-6 border-b border-border/60">
              <div className="mx-auto w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-3">
                <Sparkles className="w-5 h-5 fill-primary" />
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Reserve Your Free Seat
              </CardTitle>
              <CardDescription className="text-sm mt-1.5 text-muted-foreground">
                Build Your First AI Project in 60 Minutes • Exclusively for Engineering Students
              </CardDescription>

              {refCode && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>You were invited by a campus peer!</span>
                </div>
              )}
            </CardHeader>

            <CardContent className="pt-6">
              <RegistrationForm />
            </CardContent>
          </Card>

          {/* Quick link to leaderboard */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            <span>Want to see how your campus is ranking? </span>
            <Link to="/leaderboard" className="text-primary font-semibold hover:underline">
              View National Leaderboard
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
};

export default RegistrationPage;

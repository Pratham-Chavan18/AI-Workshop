import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { Share2, Users2, Trophy, ArrowRight, CheckCheck } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: CheckCheck,
    title: 'Register in 10 Seconds',
    description: 'Fill in your name, college, and email. Instantly receive your unique campus referral link.',
  },
  {
    step: '02',
    icon: Share2,
    title: 'Share with Batchmates',
    description: '1-click share to your WhatsApp groups, Discord servers, and LinkedIn network.',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'Climb the Leaderboard',
    description: 'Every peer who registers through your link credits you and catapults your college to #1.',
  },
];

export const ReferralSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-canvas-soft border-t border-border/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
            <Users2 className="w-3.5 h-3.5 mr-1" />
            Viral Campus Referral Loop
          </Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            The Campus Referral Challenge
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Help your college reach the top 5 nationwide. Students who refer 3+ peers unlock priority Q&A slots and bonus AI project templates.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card className="h-full border-border/80 bg-card p-6 rounded-card relative overflow-hidden group hover:border-primary/50 transition-all shadow-xs">
                  <div className="text-5xl font-black text-muted-foreground/15 absolute right-4 top-4 select-none group-hover:text-primary/15 transition-colors">
                    {s.step}
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl font-bold">{s.title}</CardTitle>
                  <CardDescription className="text-sm mt-2 leading-relaxed">
                    {s.description}
                  </CardDescription>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link to="/register">
            <Button size="lg" variant="primary" className="gap-2 px-8">
              <span>Join the Challenge & Get Your Link</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;

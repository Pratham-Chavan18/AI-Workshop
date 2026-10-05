import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sticker } from '@/components/slush/sticker';
import { Share2, Users2, Trophy, ArrowUpRight, CheckCheck } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: CheckCheck,
    title: 'Register in 10 Seconds',
    description: 'Fill in your name, college, and email. Instantly receive your unique campus referral link.',
    color: 'lavender' as const,
    badgeBg: 'bg-slush-lavender',
  },
  {
    step: '02',
    icon: Share2,
    title: 'Share with Batchmates',
    description: '1-click share to your WhatsApp batch groups, Discord coding servers, and LinkedIn network.',
    color: 'mint' as const,
    badgeBg: 'bg-slush-mint',
  },
  {
    step: '03',
    icon: Trophy,
    title: 'Climb the Leaderboard',
    description: 'Every classmate who signs up catapults your college to #1 on the national leaderboard.',
    color: 'sunburst' as const,
    badgeBg: 'bg-slush-sunburst',
  },
];

export const ReferralSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slush-paper border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <Sticker
            color="voltage"
            icon={<Users2 className="w-3.5 h-3.5" />}
            label="VIRAL CAMPUS LOOP"
            className="mb-4"
          />
          <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-black uppercase leading-tight">
            The Campus Referral Challenge
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-700 font-medium">
            Represent your engineering college. Students who invite 3+ peers unlock verified certificates, priority build reviews, and campus glory.
          </p>
        </div>

        {/* Slush 3-Column Sticker Cards */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="slush-card p-8 bg-white border border-black flex flex-col justify-between hover:bg-neutral-50 transition-colors relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-[18px] border border-black ${s.badgeBg} flex items-center justify-center text-black font-bold`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-display font-extrabold text-3xl text-neutral-400">
                      #{s.step}
                    </span>
                  </div>
                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-black uppercase leading-none mb-3">
                    {s.title}
                  </h3>
                  <p className="text-sm sm:text-base text-neutral-600 font-medium leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/register"
            className="slush-pill px-8 py-3.5 bg-black text-white hover:bg-neutral-800 text-sm sm:text-base font-bold tracking-[0.032em] inline-flex items-center gap-2 shadow-none transition-transform hover:-translate-y-0.5"
          >
            <span>Join Challenge & Get Your Link</span>
            <ArrowUpRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ReferralSection;

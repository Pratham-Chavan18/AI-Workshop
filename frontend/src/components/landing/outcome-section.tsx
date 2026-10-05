import React from 'react';
import { motion } from 'framer-motion';
import { Sticker } from '@/components/slush/sticker';
import { Cpu, Zap, Code2, Award } from 'lucide-react';

const OUTCOMES = [
  {
    icon: Cpu,
    title: 'Deploy a Real AI Project',
    description:
      'Build and publish a functioning generative AI web application from scratch that you can showcase on LinkedIn and campus recruitment interviews.',
    colorBg: 'bg-slush-lavender',
    stickerText: 'PORTFOLIO',
    stickerColor: 'lavender' as const,
  },
  {
    icon: Zap,
    title: '60 Minutes Sprint',
    description:
      'Zero fluff, no multi-week drags. High-intensity engineering sprint where every minute is designed for immediate skill acquisition.',
    colorBg: 'bg-slush-sunburst',
    stickerText: 'LIGHTNING FAST',
    stickerColor: 'sunburst' as const,
  },
  {
    icon: Code2,
    title: 'Zero AI Experience Needed',
    description:
      'If you understand basic programming fundamentals (Python or JS), our live guidance will take you all the way to cloud deployment.',
    colorBg: 'bg-slush-mint',
    stickerText: 'BEGINNER READY',
    stickerColor: 'mint' as const,
  },
  {
    icon: Award,
    title: 'Verified AI Credential',
    description:
      'Earn an official digital certificate of AI implementation verified by NxtWave to validate your hands-on engineering initiative.',
    colorBg: 'bg-slush-sky',
    stickerText: 'OFFICIAL PROOF',
    stickerColor: 'electric' as const,
  },
];

export const OutcomeSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slush-paper border-b border-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Sticker
            color="sunburst"
            label="MEASURABLE IMPACT"
            className="mb-4"
          />
          <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-black uppercase leading-tight">
            Built for Immediate Practical Value
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-700 font-medium">
            Don't just watch another tutorial. Write actual code, integrate frontier LLMs, and launch your project into live production.
          </p>
        </div>

        {/* Slush 4-Pack Color Accent Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {OUTCOMES.map((outcome, idx) => {
            const Icon = outcome.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="slush-card p-6 bg-white border border-black flex flex-col justify-between hover:bg-neutral-50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-[18px] border border-black ${outcome.colorBg} flex items-center justify-center text-black font-bold`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <Sticker color={outcome.stickerColor} label={outcome.stickerText} size="sm" />
                  </div>
                  <h3 className="font-display font-extrabold text-2xl text-black uppercase leading-none mb-2">
                    {outcome.title}
                  </h3>
                  <p className="text-sm text-neutral-600 font-medium leading-relaxed">
                    {outcome.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OutcomeSection;

import React from 'react';
import { motion } from 'framer-motion';
import { Sticker } from '@/components/slush/sticker';
import { Clock, Terminal, Bot, Sparkles, Rocket, MessageSquareCode } from 'lucide-react';

const AGENDA_ITEMS = [
  {
    time: '00:00 – 00:10',
    duration: '10 Mins',
    icon: Terminal,
    title: 'Architecture Blueprint & Workspace Spin-Up',
    description:
      'Understand how production AI apps work. Spin up your development workspace, configure environment keys, and initialize the boilerplate.',
    stickerColor: 'mint' as const,
  },
  {
    time: '00:10 – 00:30',
    duration: '20 Mins',
    icon: Bot,
    title: 'Core AI Engine & LLM Integration',
    description:
      'Connect to frontier AI models via streaming APIs. Write prompt pipelines that process user inputs and generate structured outputs in real-time.',
    stickerColor: 'sunburst' as const,
  },
  {
    time: '00:30 – 00:45',
    duration: '15 Mins',
    icon: Sparkles,
    title: 'Modern UI & Interactive State Layer',
    description:
      'Wire the AI streaming responses into a sleek, responsive user interface with optimistic updates, markdown rendering, and error boundaries.',
    stickerColor: 'lavender' as const,
  },
  {
    time: '00:45 – 00:55',
    duration: '10 Mins',
    icon: Rocket,
    title: 'Live Cloud Deployment & Custom Domain',
    description:
      'Ship your full-stack AI application live to the web. Get a publicly accessible URL ready to paste on your resume and GitHub.',
    stickerColor: 'ember' as const,
  },
  {
    time: '00:55 – 01:00',
    duration: '5 Mins',
    icon: MessageSquareCode,
    title: 'Live Q&A & Interview Portfolio Strategies',
    description:
      'Tips on presenting this project during technical interviews, open-floor questions with senior AI engineers, and certificate issuance.',
    stickerColor: 'voltage' as const,
  },
];

export const WorkshopTimeline: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-slush-concrete border-b border-black">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Sticker
            color="mint"
            icon={<Clock className="w-3.5 h-3.5" />}
            label="60-MINUTE ROADMAP"
            className="mb-4"
          />
          <h2 className="text-4xl sm:text-6xl font-extrabold font-display tracking-tight text-black uppercase leading-tight">
            Minute-by-Minute Masterclass
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-800 font-medium">
            Every single minute is engineered so you walk away with a functional, deployed AI web product.
          </p>
        </div>

        {/* Slush Timeline Cards on Concrete Gray */}
        <div className="space-y-4">
          {AGENDA_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                className="slush-card p-6 bg-white border border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-[18px] border border-black bg-slush-sky flex items-center justify-center text-black shrink-0 font-bold">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="slush-pill px-2.5 py-0.5 text-xs font-bold bg-black text-white">
                        {item.time}
                      </span>
                      <Sticker color={item.stickerColor} label={item.duration} size="sm" />
                    </div>
                    <h3 className="font-display font-extrabold text-xl sm:text-2xl text-black uppercase">
                      {item.title}
                    </h3>
                    <p className="text-sm text-neutral-700 font-medium mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WorkshopTimeline;

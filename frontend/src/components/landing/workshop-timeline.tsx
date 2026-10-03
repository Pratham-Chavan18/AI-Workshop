import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { Clock, Terminal, Bot, Sparkles, Rocket, MessageSquareCode } from 'lucide-react';

const AGENDA_ITEMS = [
  {
    time: '00:00 – 00:10',
    duration: '10 Mins',
    icon: Terminal,
    title: 'Architecture Blueprint & Workspace Spin-Up',
    description:
      'Understand how production AI apps work. Spin up your development workspace, configure environment keys, and initialize the boilerplate.',
  },
  {
    time: '00:10 – 00:30',
    duration: '20 Mins',
    icon: Bot,
    title: 'Core AI Engine & LLM Integration',
    description:
      'Connect to frontier AI models via streaming APIs. Write prompt pipelines that process user inputs and generate structured outputs in real-time.',
  },
  {
    time: '00:30 – 00:45',
    duration: '15 Mins',
    icon: Sparkles,
    title: 'Modern UI & Interactive State Layer',
    description:
      'Wire the AI streaming responses into a sleek, responsive user interface with optimistic updates, markdown rendering, and error boundaries.',
  },
  {
    time: '00:45 – 00:55',
    duration: '10 Mins',
    icon: Rocket,
    title: 'Live Cloud Deployment & Custom Domain',
    description:
      'Ship your full-stack AI application live to the web. Get a publicly accessible URL ready to paste on your resume and GitHub.',
  },
  {
    time: '00:55 – 01:00',
    duration: '5 Mins',
    icon: MessageSquareCode,
    title: 'Live Q&A & Interview Portfolio Strategies',
    description:
      'Tips on presenting this project during technical interviews, open-floor questions with senior AI engineers, and certificate issuance.',
  },
];

export const WorkshopTimeline: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-canvas-soft border-y border-border/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
            <Clock className="w-3.5 h-3.5 mr-1" />
            60-Minute Fast Track
          </Badge>
          <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Minute-by-Minute Masterclass Agenda
          </h2>
          <p className="mt-4 text-base text-muted-foreground">
            Every minute is optimized so you exit the workshop with a live, functioning AI product.
          </p>
        </div>

        {/* Timeline list */}
        <div className="mt-16 space-y-6">
          {AGENDA_ITEMS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="relative pl-8 sm:pl-10 before:absolute before:left-3.5 sm:before:left-4 before:top-3 before:bottom-0 before:w-0.5 before:bg-border last:before:hidden group"
              >
                {/* Timeline node icon */}
                <div className="absolute left-0 top-1.5 w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-primary/10 border-2 border-primary flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                </div>

                <div className="bg-card border border-border/90 rounded-2xl p-5 sm:p-6 shadow-xs group-hover:border-primary/40 transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-mono font-semibold text-primary uppercase tracking-wider">
                      {item.time}
                    </span>
                    <Badge variant="secondary" className="text-[11px] font-medium">
                      {item.duration}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-bold text-foreground mt-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                    {item.description}
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

export default WorkshopTimeline;

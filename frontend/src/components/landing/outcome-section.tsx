import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { fadeUp, viewportOnce } from '@/lib/motion';
import { Cpu, Zap, Code2, Award } from 'lucide-react';

const OUTCOMES = [
  {
    icon: Cpu,
    title: 'Deploy a Real AI Project',
    description:
      'Build and publish a functioning generative AI web application from scratch that you can showcase on LinkedIn and in campus recruitment interviews.',
    color: 'text-primary bg-primary/10 border-primary/20',
  },
  {
    icon: Zap,
    title: '60 Minutes Only',
    description:
      'No multi-week drags. High-intensity, structured engineering sprint where every minute is designed for breakthrough progress.',
    color: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  },
  {
    icon: Code2,
    title: 'Zero Prior AI Experience Required',
    description:
      'If you know foundational programming concepts (Python or JavaScript), our step-by-step guidance will take you all the way to deployment.',
    color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    icon: Award,
    title: 'Verified Completion Credential',
    description:
      'Earn an official digital certificate of AI implementation verified by NxtWave to validate your engineering initiative.',
    color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
  },
];

export const OutcomeSection: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-canvas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs uppercase tracking-widest font-bold text-primary">
            What You Will Gain
          </h2>
          <p className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Built for Immediate Practical Value
          </p>
          <p className="mt-4 text-base text-muted-foreground">
            Don't just watch another tutorial. Write actual code, integrate modern LLMs, and launch your project into production.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {OUTCOMES.map((outcome, idx) => {
            const Icon = outcome.icon;
            return (
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={viewportOnce}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
              >
                <Card className="h-full border-border/80 hover:shadow-md hover:border-primary/40 transition-all bg-card/60 backdrop-blur-sm">
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border mb-4 ${outcome.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-lg">{outcome.title}</CardTitle>
                    <CardDescription className="text-sm mt-2 leading-relaxed">
                      {outcome.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default OutcomeSection;

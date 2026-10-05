import React, { useState } from 'react';
import { Sticker } from '@/components/slush/sticker';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';

export interface ReferralShareCardProps {
  referralCode: string;
  referralUrl?: string;
  referralCount: number;
  goal: number;
}

export const ReferralShareCard: React.FC<ReferralShareCardProps> = ({
  referralCode,
  referralUrl,
  referralCount,
  goal,
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const finalReferralUrl = referralCode
    ? `${baseUrl}/register?ref=${referralCode}`
    : referralUrl || '';

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral code', err);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(finalReferralUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral link', err);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `🚀 Join me for the FREE AI Workshop: "Build Your First AI Project in 60 Minutes"!\n\n` +
    `🎓 It's tailored for final-year engineering students to launch a live AI project for their resume.\n\n` +
    `Claim your free seat here 👇\n${finalReferralUrl}\n\n` +
    `Use my referral link to represent our college on the national leaderboard! 🏆`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  return (
    <div className="slush-card h-full bg-white border border-black p-6 sm:p-8 flex flex-col justify-between shadow-none">
      <div>
        <div className="flex items-center justify-between mb-4">
          <Sticker
            color="sunburst"
            icon={<Share2 className="w-3.5 h-3.5" />}
            label="YOUR REFERRAL HUB"
            size="sm"
          />
          <span className="text-xs font-bold text-neutral-600">
            {referralCount} / {goal} Friends Credited
          </span>
        </div>

        <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-black uppercase leading-none">
          Invite Your Campus Friends
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
          Share your custom referral code or direct link to credit your student profile.
        </p>

        {/* Display Code Box */}
        <div className="mt-6 p-4 rounded-[20px] border border-black bg-slush-sky/60 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-700">
              Your Unique Referral Code
            </span>
            <p className="font-display font-extrabold text-3xl text-black tracking-wider leading-none mt-1">
              {referralCode || 'Generating...'}
            </p>
          </div>
          <button
            onClick={handleCopyCode}
            disabled={!referralCode}
            className="slush-pill px-4 py-2 bg-white text-black hover:bg-slush-mist text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copiedCode ? 'Copied Code!' : 'Copy Code'}</span>
          </button>
        </div>

        {/* Link Copy Box */}
        <div className="mt-4">
          <label className="text-xs font-bold text-black uppercase tracking-wider block mb-1">
            Direct Shareable URL
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={finalReferralUrl || 'Loading referral URL...'}
              className="flex-1 h-11 px-4 text-xs font-mono bg-slush-mist/50 border border-black rounded-pill text-black select-all focus:outline-none"
            />
            <button
              onClick={handleCopyUrl}
              disabled={!finalReferralUrl}
              className="slush-pill h-11 px-5 bg-black text-white hover:bg-neutral-800 text-xs font-bold shrink-0 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedUrl ? 'Copied Link!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 1-Click WhatsApp Share Button */}
      <div className="pt-6 mt-6 border-t border-black/10">
        {finalReferralUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="slush-pill w-full py-3.5 bg-slush-mint text-black hover:bg-slush-mint/80 text-sm font-bold flex items-center justify-center gap-2 shadow-none transition-transform hover:-translate-y-0.5"
          >
            <MessageCircle className="w-5 h-5" />
            <span>Share to WhatsApp Groups (1-Click)</span>
          </a>
        ) : (
          <div className="slush-pill w-full py-3.5 bg-neutral-200 text-neutral-500 text-sm font-bold flex items-center justify-center gap-2">
            <span>Referral link loading...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralShareCard;

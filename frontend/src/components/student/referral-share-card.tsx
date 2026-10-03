import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Copy, Check, MessageCircle } from 'lucide-react';

export interface ReferralShareCardProps {
  referralCode: string;
  referralUrl: string;
  referralCount: number;
  goal: number;
}

export const ReferralShareCard: React.FC<ReferralShareCardProps> = ({
  referralCode,
  referralUrl,
  referralCount,
  goal,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy referral link', err);
    }
  };

  const whatsappMessage = encodeURIComponent(
    `🚀 Join me for a FREE online workshop: "Build Your First AI Project in 60 Minutes"!\n\n` +
    `🎓 It's tailored for final-year engineering students to launch a live AI project for their resume.\n\n` +
    `Claim your free seat here 👇\n${referralUrl}\n\n` +
    `Use my referral link to represent our college on the national leaderboard! 🏆`
  );

  const whatsappUrl = `https://wa.me/?text=${whatsappMessage}`;

  return (
    <Card className="h-full border-border/80 bg-card/95 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="default" className="text-xs uppercase font-bold tracking-wider">
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Your Referral Hub
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">
            Progress: {referralCount} / {goal} Friends
          </span>
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold mt-2">
          Invite Your Campus Friends
        </CardTitle>
        <CardDescription className="text-sm">
          Share your custom referral code or direct link across WhatsApp and social channels.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Referral Code Display Box */}
        <div className="p-4 bg-muted/60 border border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">
              Your Unique Referral Code
            </span>
            <div className="font-mono text-3xl font-extrabold text-primary tracking-widest mt-0.5">
              {referralCode}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className={`gap-1.5 transition-all text-xs font-semibold ${
              copied ? 'border-emerald-500 text-emerald-600 bg-emerald-50' : ''
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Link</span>
              </>
            )}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {/* WhatsApp Share CTA */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="whatsapp-share-btn"
            className="w-full inline-block"
          >
            <Button
              type="button"
              variant="primary"
              className="w-full gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white py-6 shadow-sm border-0"
            >
              <MessageCircle className="w-5 h-5 fill-white text-white" />
              <span>Invite on WhatsApp</span>
            </Button>
          </a>

          {/* Copy Direct Link Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={handleCopy}
            className="w-full gap-2 py-6 text-foreground font-semibold"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-500" />
                <span className="text-emerald-600">Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                <span>Copy Referral URL</span>
              </>
            )}
          </Button>
        </div>

        {/* Link preview hint */}
        <p className="text-[11px] text-muted-foreground truncate bg-canvas-soft p-2.5 rounded-lg border border-border/60">
          <span className="font-semibold text-foreground">Your Link: </span>
          {referralUrl}
        </p>
      </CardContent>
    </Card>
  );
};

export default ReferralShareCard;

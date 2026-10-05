import React from 'react';

export type StickerColor = 'electric' | 'mint' | 'lavender' | 'ember' | 'sunburst' | 'voltage' | 'paper';

interface StickerProps {
  color?: StickerColor;
  icon?: React.ReactNode;
  label?: string;
  className?: string;
  rotate?: number;
  size?: 'sm' | 'md' | 'lg';
}

const colorMap: Record<StickerColor, string> = {
  electric: 'bg-slush-electric text-black',
  mint: 'bg-slush-mint text-black',
  lavender: 'bg-slush-lavender text-black',
  ember: 'bg-slush-ember text-white',
  sunburst: 'bg-slush-sunburst text-black',
  voltage: 'bg-slush-voltage text-white',
  paper: 'bg-slush-paper text-black',
};

const sizeMap = {
  sm: 'px-2.5 py-1 text-xs gap-1.5 rounded-[16px]',
  md: 'px-3.5 py-1.5 text-sm gap-2 rounded-[20px]',
  lg: 'px-4 py-2 text-base gap-2.5 rounded-[22px]',
};

export const Sticker: React.FC<StickerProps> = ({
  color = 'mint',
  icon,
  label,
  className = '',
  rotate = 0,
  size = 'md',
}) => {
  return (
    <div
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
      className={`inline-flex items-center justify-center font-bold tracking-tight border border-black select-none transition-transform duration-200 hover:scale-105 ${colorMap[color]} ${sizeMap[size]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label && <span>{label}</span>}
    </div>
  );
};

export default Sticker;

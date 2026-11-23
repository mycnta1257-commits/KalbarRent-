import { useState } from 'react';
import { Shirt } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  positionClass?: string;
}

export function ResilientImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  positionClass = 'object-top',
}: ResilientImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full bg-[#EFECE5] flex flex-col items-center justify-center p-6 text-center text-zinc-500"
      >
        <Shirt className="w-10 h-10 mb-2 text-[#0F5132]/60" strokeWidth={1.5} />
        <p className="text-xs font-medium text-zinc-700 line-clamp-2">{alt}</p>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={`${className} ${positionClass}`}
    />
  );
}

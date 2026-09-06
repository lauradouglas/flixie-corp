// @ts-ignore
import flixieLogo from '../assets/brand/flixie_text_1024.png';

interface BrandLogoProps {
  className: string;
  alt?: string;
}

export default function BrandLogo({ className, alt = '' }: BrandLogoProps) {
  return (
    <>
      <img src={flixieLogo} alt={alt} className={className} />
      {/* Recolour only the x, preserving the original wordmark and transparency. */}
      <img
        src={flixieLogo}
        alt=""
        aria-hidden="true"
        className={className}
        style={{ clipPath: 'inset(36% 40% 37% 41%)', filter: 'brightness(0) invert(1)', pointerEvents: 'none' }}
      />
    </>
  );
}

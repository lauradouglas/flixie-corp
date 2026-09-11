// @ts-ignore
import flixieLogo from '../assets/brand/flixie-wordmark.png';

interface BrandLogoProps {
  className: string;
  alt?: string;
}

export default function BrandLogo({ className, alt = '' }: BrandLogoProps) {
  return (
    <>
      <img src={flixieLogo} width={256} height={256} alt={alt} className={className} />
      {/* Recolour only the x, preserving the original wordmark and transparency. */}
      <img
        src={flixieLogo} width={256} height={256}
        alt=""
        aria-hidden="true"
        className={className}
        style={{ clipPath: 'inset(36% 40% 37% 41%)', filter: 'brightness(0) invert(1)', pointerEvents: 'none' }}
      />
    </>
  );
}

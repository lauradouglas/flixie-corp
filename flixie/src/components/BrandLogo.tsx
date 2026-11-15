import WordmarkArtwork from './WordmarkArtwork';
export default function BrandLogo({className,alt=''}:{className:string;alt?:string}){
  return <WordmarkArtwork className={className} alt={alt}/>;
}

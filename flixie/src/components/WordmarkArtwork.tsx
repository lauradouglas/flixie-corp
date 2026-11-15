/** One shared wordmark asset; both colour sections have aligned bottom edges. */
export default function WordmarkArtwork({className,alt=''}:{className?:string;alt?:string}){
  return <img className={className} src="/web/flixie-wordmark-matched.png?v=header-1" width={240} height={80} style={{objectFit:'contain'}} alt={alt}/>;
}

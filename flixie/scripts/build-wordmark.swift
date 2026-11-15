import Foundation
import CoreGraphics
import CoreText
import ImageIO
import UniformTypeIdentifiers
let args=CommandLine.arguments
let fontURL=URL(fileURLWithPath:args[1])
let descriptors=CTFontManagerCreateFontDescriptorsFromURL(fontURL as CFURL) as! [CTFontDescriptor]
let variation:[NSNumber:NSNumber]=[NSNumber(value:2003265652):NSNumber(value:800)]
let descriptor=CTFontDescriptorCreateCopyWithAttributes(descriptors[0],[kCTFontVariationAttribute:variation] as CFDictionary)
let font=CTFontCreateWithFontDescriptor(descriptor,100,nil)
let text=NSAttributedString(string:"flixie",attributes:[NSAttributedString.Key(kCTFontAttributeName as String):font,NSAttributedString.Key(kCTKernAttributeName as String):-2.0,NSAttributedString.Key(kCTLigatureAttributeName as String):0])
let line=CTLineCreateWithAttributedString(text)
let runs=CTLineGetGlyphRuns(line) as! [CTRun]
var letters:[(String,CGPath)]=[]
var bounds=CGRect.null
for run in runs {
 let n=CTRunGetGlyphCount(run)
 var glyphs=[CGGlyph](repeating:0,count:n),positions=[CGPoint](repeating:.zero,count:n),indices=[CFIndex](repeating:0,count:n)
 CTRunGetGlyphs(run,CFRange(location:0,length:0),&glyphs);CTRunGetPositions(run,CFRange(location:0,length:0),&positions);CTRunGetStringIndices(run,CFRange(location:0,length:0),&indices)
 for j in 0..<n {
  guard let outline=CTFontCreatePathForGlyph(font,glyphs[j],nil) else{continue}
  // All letters use exactly the same font/weight/size. Align visible bottoms
  // inside the final vector asset, including the e's curved overshoot.
  var transform=CGAffineTransform(translationX:positions[j].x,y:-outline.boundingBoxOfPath.minY)
  let path=outline.copy(using:&transform)!
  bounds=bounds.union(path.boundingBoxOfPath)
  letters.append((indices[j]<4 ? "#fff" : "#7c4dff",path))
 }
}
func f(_ n:CGFloat)->String {String(format:"%.3f",n)}
let canvasWidth:CGFloat=240,canvasHeight:CGFloat=80,baseline:CGFloat=75,padX=(canvasWidth-bounds.width)/2
var svg="<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"\(f(canvasWidth))\" height=\"\(f(canvasHeight))\" viewBox=\"0 0 \(f(canvasWidth)) \(f(canvasHeight))\"><title>Flixie</title><!-- All six letters: bundled Manrope, weight 800, size 100; shared visible bottom. One outlined asset, no runtime font or letter transforms. -->"
for (color,path) in letters {
 var transform=CGAffineTransform(a:1,b:0,c:0,d:-1,tx:padX-bounds.minX,ty:baseline)
 let outline=path.copy(using:&transform)!
 var d=""
 outline.applyWithBlock { pointer in
  let e=pointer.pointee,p=e.points
  switch e.type {
  case .moveToPoint:d += "M\(f(p[0].x)) \(f(p[0].y))"
  case .addLineToPoint:d += "L\(f(p[0].x)) \(f(p[0].y))"
  case .addQuadCurveToPoint:d += "Q\(f(p[0].x)) \(f(p[0].y)) \(f(p[1].x)) \(f(p[1].y))"
  case .addCurveToPoint:d += "C\(f(p[0].x)) \(f(p[0].y)) \(f(p[1].x)) \(f(p[1].y)) \(f(p[2].x)) \(f(p[2].y))"
  case .closeSubpath:d += "Z"
  @unknown default:break
  }
 }
 svg += "<path fill=\"\(color)\" d=\"\(d)\"/>"
}
svg += "</svg>"
try svg.write(toFile:args[2],atomically:true,encoding:.utf8)
// Rasterize the approved outlines once, preserving a shared opaque last row.
// 576×192 gives exact 3:1 geometry and a 180px baseline for a96×32 header.
if args.count>3 {
 let scale:CGFloat=2.4,width=576,height=192
 let context=CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:width*4,space:CGColorSpace(name:CGColorSpace.sRGB)!,bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
 context.scaleBy(x:scale,y:scale);context.translateBy(x:padX-bounds.minX,y:canvasHeight-baseline)
 for(color,path) in letters {
  if color=="#fff" {context.setFillColor(red:1,green:1,blue:1,alpha:1)} else {context.setFillColor(red:124/255,green:77/255,blue:1,alpha:1)}
  context.addPath(path);context.fillPath()
 }
 let destination=CGImageDestinationCreateWithURL(URL(fileURLWithPath:args[3]) as CFURL,UTType.png.identifier as CFString,1,nil)!
 CGImageDestinationAddImage(destination,context.makeImage()!,nil)
 if !CGImageDestinationFinalize(destination){fatalError("Could not render wordmark PNG")}
}
print("Outlined wordmark: 6 letters, one font/size/weight; bounds \(f(canvasWidth)) × \(f(canvasHeight)); \(svg.utf8.count) bytes")

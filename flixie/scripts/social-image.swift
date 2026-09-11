// Optional macOS regeneration helper, run from flixie/. Builds use the committed PNG.
import AppKit
let width = 1200, height = 630
let bitmap = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: bitmap)
NSColor(srgbRed: 18/255, green: 10/255, blue: 36/255, alpha: 1).setFill()
NSBezierPath.fill(NSRect(x: 0, y: 0, width: width, height: height))
func text(_ string: String, _ x: Int, _ y: Int, _ size: CGFloat, _ color: NSColor) {
  (string as NSString).draw(at: NSPoint(x: x, y: y), withAttributes: [.font: NSFont.systemFont(ofSize: size, weight: .semibold), .foregroundColor: color])
}
let purple = NSColor(srgbRed: 179/255, green: 136/255, blue: 255/255, alpha: 1)
text("Flixie", 80, 470, 64, purple)
text("Find your next film", 80, 305, 72, .white)
text("with friends.", 80, 215, 72, .white)
text("Discover. Save. Plan a movie night.", 84, 113, 30, purple)
text("flixie.co.uk", 84, 55, 24, .white)
NSGraphicsContext.restoreGraphicsState()
try bitmap.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: "public/og/flixie-social.png"))

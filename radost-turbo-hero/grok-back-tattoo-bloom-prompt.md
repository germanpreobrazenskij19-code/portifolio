Create exactly one production-ready Grok Imagine hero video from the supplied tattoo photograph.

Source image: `/Users/retention/Documents/auto/output/radost-turbo-hero/assets/hero-back-tattoo.png`.

First use `image_edit` to stage a 16:9 wide end frame. Preserve the woman, pose, hair, hand, chair, room, lighting, and the complete black back tattoo as closely as possible. Keep her full back visible on the right half of the frame. Extend the scene naturally to the left as a dark, subdued continuation with enough negative space for website copy. Do not add text, logos, symbols, or new objects. Save this staged tattooed end frame.

Then use `image_edit` on that staged wide frame to create the exact matching start frame: remove every tattoo line and all ink from her back, shoulders, and neck, reconstructing natural bare skin while preserving the exact pose, anatomy, crop, lighting, background, and camera. Save this clean start frame.

Then call `reference_to_video` once with the clean wide frame pinned as `first_frame` and the tattooed wide frame pinned as `last_frame`. Use aspect ratio 16:9, resolution 720p, duration approximately 6 seconds.

Animation: the back begins completely clean. At the center of the upper-middle back, the central ornamental shape appears first, then black ink lines, petals, flowers, and geometric ornament organically grow outward across the shoulder blades, down the spine, and toward both shoulders until the complete tattoo matches the pinned last frame. The tattoo must look embedded in the skin. Keep the woman, hand, hair, body, chair, room, camera, lighting, and framing perfectly still. No camera movement, no body movement, no morphing anatomy, no gold graphics, no floating particles, no glow, no text, no logo, no cuts. Hold the completed tattoo during the final second. The clip does not need to loop.

Generate only one video. Copy the result to `/Users/retention/Documents/auto/output/radost-turbo-hero/assets/grok-back-tattoo-bloom.mp4`. Also copy the staged wide start and end frames to `assets/grok-back-start.png` and `assets/grok-back-end.png`. Report the final paths and metadata.

Create exactly one safe, graphic-only tattoo reveal video with Grok Imagine. There must be no person, body, skin, nudity, photograph, or human figure in the generated video.

Final artwork reference: `/Users/retention/Documents/auto/output/radost-turbo-hero/assets/back-tattoo-white.png`. It is a 16:9 canvas containing a black ornamental tattoo design on a perfectly white background, positioned where it will later be composited by the website.

First use `image_edit` to create a matching blank start frame from this reference: remove all black tattoo artwork and leave a perfectly flat solid white canvas of the same dimensions and aspect ratio. Save it as `/Users/retention/Documents/auto/output/radost-turbo-hero/assets/back-tattoo-blank.png`.

Then call `reference_to_video` exactly once with that blank white image pinned as `first_frame` and `back-tattoo-white.png` pinned as `last_frame`. Use 16:9, 720p, approximately 6 seconds.

Animate only the black line art on the flat white canvas. The central upper-middle ornamental form draws itself first, then crisp black lines, petals, flowers, and geometric details grow outward symmetrically and downward until the complete pinned tattoo artwork is visible. Keep the canvas and artwork placement perfectly still. No camera movement, no texture, no paper grain, no shadows, no color, no glow, no particles, no text, no logo, no extra marks. Hold the complete artwork for the final second. The clip does not need to loop.

Copy the resulting video to `/Users/retention/Documents/auto/output/radost-turbo-hero/assets/grok-back-ink-bloom.mp4` and report its metadata.

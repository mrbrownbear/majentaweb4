# Validation and delivery status

## Verified

The self-contained file:// preview also passed its functional test with no errors or failed asset requests.

- Production build succeeds with Vite.
- Supplied logo, source logo and delivered logo have identical SHA-256 hashes.
- Optimized model loads locally and retains source PBR textures.
- Runtime model: 250,000 triangles and 281 independently transformed source-surface groups.
- Groups render together in one model draw call; the tested full scene reports six draw calls.
- Desktop and mobile screenshots cover drawing, facade, entrance, interior, staircase, workspace, upper level, exploded view and geometric MAJENTA finale.
- No JavaScript page errors or failed asset requests in the functional browser pass.
- Returning from the finale to an earlier progress value reproduces the same camera/chapter state.
- Reduced-motion mode switches to stepped states; chapter navigation responds correctly.
- The tested 390px mobile layout has no horizontal document overflow.
- The loader disappears after loading; contact links lead to Majenta's existing contact page.
- No credentials, job subscription tokens or expiring provider URLs are included in the application runtime.

## Scope and limitations

This is a complete runnable implementation and source package, delivered through the requested ZIP fallback. It has not been published to a live domain. Crea8 Worlds 3.6.4 accepted the specification audit but repeatedly rejected rendering with an inconsistent animated-entity count; the runtime was implemented locally.

The Hyper3D model is an AI-generated architectural pavilion, not a construction-ready BIM model. Its surfaces were partitioned spatially because the provider delivered one fused mesh. These groups are not authored semantic BIM components. The cinematic composition uses its available interior, staircase and balcony geometry. The source does not reproduce every architectural detail in the reference brief, including a fully authored double-height atrium, retractable door system and landscaped courtyard. Close-up geometry shows generation artifacts. This package should not be described as 100% compliant with the original photorealistic architectural-production brief.

The final word is assembled from original model surfaces, not replacement HTML. Its sculptural surface remains fragmented by the source geometry. Browser checks establish functional behaviour on the tested Chromium runtime; they do not certify performance on every device or all camera-clearance positions between sampled frames.

## Test environment

Chromium 153, software WebGL/SwiftShader; desktop 1440×900 and mobile 390×844. Automated page-error and request-failure capture, selected screenshots and navigation/state checks. No claim of measured 60fps on physical mobile hardware.

## Included

Self-contained Open-Majenta.html preview, editable source, dependency lockfile, built static site (`dist`), optimized runtime GLB, original generated GLB, exact SVG logo, original brief, production blueprint, setup instructions and browser evidence. No API keys are needed to run the site.

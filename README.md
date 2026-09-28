# Majenta — Digital engineering in motion

An interactive Three.js architectural journey built around a bespoke Hyper3D model and the exact supplied Majenta SVG.

## Quick preview

Unzip the package and double-click **Open-Majenta.html** in a modern desktop browser. This self-contained preview includes the model, textures, logo, CSS and JavaScript. It does not need Node.js or an internet connection to display the scene. External service/contact links still open Majenta’s live website.

## Run

Requires Node.js 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Scroll, use the six chapter controls, or use left/right arrow keys when focus is outside a control. The motion button switches between interpolated and stepped camera states.

## Production

```sh
npm run build
npm run preview
```

Deploy the contents of `dist/` to a static host. The included `dist/` is already built. Use an HTTP server; browsers restrict 3D model loading from a file:// URL. No environment variables, API keys or server backend are required. All model and brand assets are local. The contact and service links lead to Majenta's existing website.

## Project

- `src/main.js`: deterministic scroll state, architectural source-mesh partitioning, model loading, camera path, lighting and final geometric word assembly.
- `src/style.css`: responsive editorial interface.
- `public/assets/building.glb`: optimized source architecture with PBR textures.
- `public/assets/logo.svg`: exact user-supplied vector logo.
- `CINEMATIC_PRODUCTION_BLUEPRINT.md`: authored production plan.
- `VALIDATION.md`: measured checks and scope notes.

## Model provenance

The source architecture was generated through the user's connected Hyper3D Rodin account. The original mesh is partitioned into spatial surface groups at runtime. These are derived from the actual source triangles, not substitute building primitives. Source positions, normals and texture coordinates are retained. Construction, exploded and final word transforms derive from absolute scroll progress and reverse consistently.

## Licensing

Majenta logo and brand content: provided/authorised by the user. Hyper3D model use remains subject to that account's terms. Dependencies retain their own licences in their packages. Original implementation code is supplied for the user's use and modification.

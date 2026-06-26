# WebGL Architecture Notes

The reference material points to a small full-screen WebGL application rather than a traditional dashboard page:

- A minimal document boots first.
- A loader owns the first visual moment while the 3D app is prepared.
- The WebGL runtime is loaded as a separate client module.
- The root app occupies the full viewport and disables ordinary page scrolling during play.
- Interaction belongs to the 3D app; surrounding UI stays thin and operational.

For Kırmızı Tabela this means:

1. Keep Next.js as the delivery shell, but load the game runtime through a client-only module.
2. Keep pharmacy rules, scenario data, hotspots and money/date logic outside React components.
3. Keep React Three Fiber components focused on rendering, movement and interaction.
4. Treat the HUD as an overlay, not the product itself.
5. Add a real asset pipeline next: licensed/owned GLB avatars, pharmacy fixtures, shelves, products, depot truck and street props.

Current implementation changes:

- `components/GameClient.tsx` dynamically loads the playable WebGL module.
- `components/GameBootLoader.tsx` owns the loading moment.
- `game/reboot.ts` owns scenario state, hotspots and interaction rules.
- `components/RebootGame.tsx` now focuses on UI and 3D scene composition.
- `scripts/generate-game-assets.mjs` creates the first project-owned GLB asset set.
- `public/assets/game/asset-manifest.json` lists the generated model files consumed by the scene.

Do not copy third-party bundled source or assets. The target is to copy the discipline of the architecture, not the implementation.

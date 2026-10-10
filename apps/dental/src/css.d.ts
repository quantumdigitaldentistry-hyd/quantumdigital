// TS 6 type-checks side-effect imports; declare CSS so `import '../global.css'` passes
// without relying on Expo's generated (gitignored) expo-env.d.ts.
declare module '*.css';

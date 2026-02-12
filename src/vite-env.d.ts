/// <reference types="vite/client" />

// Add typings for Vite's import.meta.glob / globEager used in the project
// Adjust return types if you store additional metadata alongside the default export

declare interface ImportMeta {
  globEager<T = { default: string }>(pattern: string): Record<string, T>;
  glob<T = any>(pattern: string): Record<string, () => Promise<T>>;
}

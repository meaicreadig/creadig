import { dirname } from "node:path"
import { fileURLToPath } from "node:url"
import { FlatCompat } from "@eslint/eslintrc"

/**
 * Vorher gab es GAR KEINE ESLint-Konfiguration: `npm run lint` rief
 * `next lint` auf, fand nichts und beendete sich mit Code 1. Jede CI, die
 * das Script ausführt, lief rot — nicht wegen eines Fehlers im Code,
 * sondern weil das Werkzeug nie eingerichtet wurde.
 *
 * `next lint` ist in Next 15 abgekündigt; das Script ruft jetzt direkt die
 * ESLint-CLI. `FlatCompat` übersetzt die (noch klassischen) Presets von
 * `eslint-config-next` in das Flat-Config-Format von ESLint 9.
 */
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) })

const config = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "_legacy/**",
      ".claude/**",
      ".video-analysis/**",
      "next-env.d.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Das Logo ist ein 8-KB-SVG, das ohne Layout-Shift und ohne
      // Optimierungs-Pipeline sofort stehen soll — <img> ist hier die
      // bewusste Wahl, siehe components/brand/logo.tsx.
      "@next/next/no-img-element": "off",
    },
  },
]

export default config

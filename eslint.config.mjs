import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Comentarios como // texto dentro de JSX — patrón habitual en GameNook
      "react/jsx-no-comment-textnodes": "off",
      // `any` explícito — hay varios en rutas de API y callbacks de NextAuth
      "@typescript-eslint/no-explicit-any": "off",
      // Variables declaradas pero no usadas — warnings, no errores críticos
      "@typescript-eslint/no-unused-vars": "warn",
      // <img> en lugar de next/image — decisión consciente en el proyecto
      "@next/next/no-img-element": "off",
      // Entidades HTML sin escapar (" en JSX)
      "react/no-unescaped-entities": "off",
    },
  },
];

export default eslintConfig;
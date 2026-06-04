import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { FlatCompat } from "@eslint/eslintrc";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname
});

export default tseslint.config(
  {
    ignores: ["dist", "node_modules", "coverage"]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...compat.extends("plugin:prettier/recommended"),
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname
      }
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  }
);


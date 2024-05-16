import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginUnicorn from "eslint-plugin-unicorn";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  pluginReactConfig,
  ...compat.extends("plugin:react-hooks/recommended"),
  pluginUnicorn.configs["flat/all"],
  ...compat.plugins("react-compiler"),
  {
    ignores: ["*", "!src"],
  },
  {
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      eqeqeq: ["error", "always", { null: "ignore" }],
      curly: "warn",
      "multiline-comment-style": ["warn", "separate-lines"],
      "no-console": ["error", { allow: ["warn", "error"] }],
      "sort-imports": "warn",
      "react/react-in-jsx-scope": "off",
      "react-compiler/react-compiler": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/restrict-template-expressions": "off",
      "unicorn/filename-case": [
        "error",
        {
          case: "kebabCase",
          ignore: [/\.tsx$/],
        },
      ],
      "unicorn/no-null": "off",
      "unicorn/prevent-abbreviations": [
        "error",
        {
          ignore: [/Ref$/],
        },
      ],
    },
  },
];

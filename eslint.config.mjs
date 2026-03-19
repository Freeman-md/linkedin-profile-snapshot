import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

const browserGlobals = {
  ...globals.browser,
  ...globals.webextensions,
};

export default [
  {
    ignores: [".output/**", ".wxt/**", "coverage/**", "node_modules/**"],
  },
  js.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...browserGlobals,
      },
      parser: tsParser,
      parserOptions: {
        project: false,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      "no-undef": "off",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          "argsIgnorePattern": "^_",
          "caughtErrorsIgnorePattern": "^_"
        }
      ]
    },
  },
  {
    files: ["*.config.{js,mjs,cjs,ts}", "tests/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
];

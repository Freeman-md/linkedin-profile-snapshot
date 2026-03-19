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
        ...globals.node,
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
];

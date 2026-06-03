import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
    {
        files: ["**/*.ts"],
        languageOptions: {
            parser: tsParser,
        },
        plugins: {
            "@typescript-eslint": tsPlugin,
        },
        rules: {
            "no-console": "warn",                // Warns you if temporary console.logs are left behind
            "@typescript-eslint/no-unused-vars": "error", // Crashes the build if variables are declared but forgotten
            "semi": ["error", "always"],         // Forces semicolons at the end of every line
        },
    },
];
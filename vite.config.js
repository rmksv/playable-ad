import {defineConfig} from "vite";
import legacy from "@vitejs/plugin-legacy";
import viteCompression from "vite-plugin-compression";
import path from "path";

export default defineConfig({
    base: "./",
    build: {
        outDir: "dist",
        assetsInlineLimit: 0,
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
                assetFileNames: "[name]-[hash][extname]",
            },
        },
        minify: "terser",
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true,
            },
            output: {
                comments: false,
            },
        },
    },
    plugins: [
        legacy({targets: ["defaults", "not IE 11"]}),
        viteCompression(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        open: true,
        port: 3000,
    },
});

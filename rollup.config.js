import postcss from "rollup-plugin-postcss";
import cssnano from "cssnano";
import purgecss from "@fullhuman/postcss-purgecss";
import replace from "@rollup/plugin-replace";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import babel from "@rollup/plugin-babel";
import html from "@rollup/plugin-html";
import { terser } from "rollup-plugin-terser";
import serve from "rollup-plugin-serve";
import livereload from "rollup-plugin-livereload";

const defaultExtractor = content => content.match(/[A-Za-z0-9-_:/]+/g) || [];
const purgeContent = ["src/**/*.js", "src/**/*.ts", "public/**/*.html"];

const isProd = process.env.NODE_ENV === "production";
const extensions = [".js", ".ts", ".tsx", "jsx"];

export default {
  input: "src/index.ts",
  output: {
    file: "public/index.js",
    format: "iife"
  },
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify(
        isProd ? "production" : "development"
      )
    }),
    resolve({
      extensions
    }),
    commonjs({
      include: /node_modules/
    }),
    babel({
      extensions,
      exclude: /node_modules/,
      babelrc: false,
      runtimeHelpers: true,
      presets: [
        "@babel/preset-env",
        "@babel/preset-react",
        "@babel/preset-typescript"
      ],
      plugins: [
        [
          "@babel/transform-react-jsx",
          {
            pragma: "h",
            useBuiltIns: true
          }
        ],
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-proposal-class-properties",
        [
          "@babel/plugin-proposal-object-rest-spread",
          {
            useBuiltIns: true
          }
        ],
        [
          "@babel/plugin-transform-runtime",
          {
            corejs: 3,
            helpers: true,
            regenerator: true,
            useESModules: false
          }
        ]
      ]
    }),
    html({
      fileName: "index.html",
      title: "Rollup + TypeScript + React = ❤️",
      template: async ({ attributes, title, files, meta, publicPath }) => {
        const scripts = (files.js || [])
          .map(({ fileName }) => {
            const attrs = makeHtmlAttributes(attributes.script);
            return `<script src="${publicPath}${fileName}"${attrs}></script>`;
          })
          .join("\n");

        const links = (files.css || [])
          .map(({ fileName }) => {
            const attrs = makeHtmlAttributes(attributes.link);
            return `<link href="${publicPath}${fileName}" rel="stylesheet"${attrs}>`;
          })
          .join("\n");

        const metas = meta
          .map(input => {
            const attrs = makeHtmlAttributes(input);
            return `<meta${attrs}>`;
          })
          .join("\n");

        return `
<!doctype html>
<html${makeHtmlAttributes(attributes.html)}>
  <head>
    ${metas}
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    ${links}
  </head>
  <body class="font-sans">
   <div id="app"></div>
    ${scripts}
  </body>
</html>`;
      }
    }),
    postcss({
      extract: "public/index.css",
      plugins: [
        require("postcss-import"),
        require("tailwindcss")("./tailwind.config.js"),
        require("autoprefixer"),
        process.env.NODE_ENV === "production" &&
          purgecss({
            content: purgeContent,
            defaultExtractor
          }),
        process.env.NODE_ENV === "production" &&
          cssnano({
            preset: [
              "default",
              {
                discardComments: {
                  removeAll: true
                }
              }
            ]
          })
      ].filter(Boolean)
    }),
    isProd &&
      terser({
        output: {
          comments: false
        }
      }),
    !isProd &&
      serve({
        host: "localhost",
        port: 3000,
        open: true,
        contentBase: ["public"]
      }),
    !isProd &&
      livereload({
        watch: "public"
      })
  ]
};

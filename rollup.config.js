const { default: resolve } = require("@rollup/plugin-node-resolve");
const commonjs = require("@rollup/plugin-commonjs");
const { terser } = require("rollup-plugin-terser");
const htmlPlugin = require("@rollup/plugin-html");
const postcss = require("rollup-plugin-postcss");
const purgecss = require("@fullhuman/postcss-purgecss");
const cssnano = require("cssnano");
const typescript = require("rollup-plugin-typescript2");
const livereload = require("rollup-plugin-livereload");

const { default: html, makeHtmlAttributes } = htmlPlugin;

const production = !process.env.ROLLUP_WATCH;
const isDevServer = !!process.env.ROLLUP_LIVERELOAD;

console.log(resolve);
function serve({ publicDir = "public", port = 3000 }) {
  let server;

  function toExit() {
    if (server) server.kill(0);
  }

  return {
    writeBundle() {
      if (server) return;
      server = require("child_process").spawn(
        "sirv",
        [publicDir, "--dev", `--port ${port}`],
        {
          stdio: ["ignore", "inherit", "inherit"],
          shell: true
        }
      );

      process.on("SIGTERM", toExit);
      process.on("exit", toExit);
    }
  };
}

const defaultExtractor = content => content.match(/[A-Za-z0-9-_:/]+/g) || [];

const plugins = ({
  cssOutput,
  publicPath = "/",
  htmlFile = "index.html",
  tailwindConfig,
  purgeContent = ["src/**/*.js", "src/**/*.ts", "public/**/*.html"],
  purgeExtractor = defaultExtractor
}) =>
  [
    resolve({
      browser: true
    }),
    commonjs({
      include: "node_modules/**"
    }),
    typescript({
      typescript: require("typescript")
    }),
    postcss({
      extract: cssOutput, //path.resolve("index.css"),
      plugins: [
        require("postcss-import"),
        require("tailwindcss")(tailwindConfig),
        require("autoprefixer"),
        process.env.NODE_ENV === "production" &&
          purgecss({
            content: purgeContent,
            defaultExtractor: purgeExtractor
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
    html({
      publicPath,
      fileName: htmlFile,
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
    {{embed}}
    ${scripts}
  </body>
</html>`;
      }
    }),
    process.env.NODE_ENV === "production" &&
      terser({
        output: {
          comments: false
        }
      })
  ].filter(Boolean);

const devServer = ({
  input = "src/index.ts",
  output = "public/bundle.js",
  ...configs
} = {}) => ({
  input,
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: output
  },
  plugins: [
    resolve({
      browser: true
    }),
    commonjs({
      include: "node_modules/**"
    }),
    typescript({
      typescript: require("typescript")
    }),
    serve(configs),
    livereload("public")
  ],
  watch: {
    clearScreen: false
  }
});

const build = ({ input = "src/index.ts", ...configs } = {}) => ({
  input,
  output: {
    format: "esm",
    sourcemap: !production
  },
  plugins: plugins(configs)
});

module.exports = {
  build,
  devServer,
  default: isDevServer ? devServer : build
};

#!/usr/bin/env node

"use strict";

process.on("unhandledRejection", err => {
  throw err;
});

const spawn = require("react-dev-utils/crossSpawn");
const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === "build" || x === "eject" || x === "start" || x === "test"
);
const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (["build", "eject", "start", "test"].includes(script)) {
  const result = spawn.sync(
    process.execPath,
    nodeArgs
      .concat(require.resolve("../scripts/" + script))
      .concat(args.slice(scriptIndex + 1)),
    { stdio: "inherit" }
  );
  if (result.signal) {
    if (result.signal === "SIGKILL") {
      console.log(
        "The build failed because the process exited too early. " +
          "This probably means the system ran out of memory or someone called " +
          "`kill -9` on the process."
      );
    } else if (result.signal === "SIGTERM") {
      console.log(
        "The build failed because the process exited too early. " +
          "Someone might have called `kill` or `killall`, or the system could " +
          "be shutting down."
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log('Unknown script "' + script + '".');
  console.log("Perhaps you need to update react-scripts?");
  console.log(
    "See: https://facebook.github.io/create-react-app/docs/updating-to-new-releases"
  );
}

// const Module = require("module");

// const get = prop => value => value[prop];
// const flatten = (others, next) => others.concat(next);
// const getLoadersFromRules = (rules, path, loaderName) =>
//   rules
//     .filter(get(path))
//     .map(get(path))
//     .reduce(flatten, [])
//     .filter(get("loader"))
//     .filter(({ loader }) => loader.includes(loaderName));

// const script = process.argv[2] || "start";
// process.env.NODE_ENV = script === "build" ? "production" : "development";

// const webpackConfigPath = "react-scripts/config/webpack.config";
// const createJestConfigPath = "react-scripts/scripts/utils/createJestConfig";

// // load original configs
// const webpackConfig = require(webpackConfigPath)(process.env.NODE_ENV);
// if (!webpackConfig) {
//   throw new Error(`no Webpack config found for: ${webpackConfigPath}`);
// }
// const { module: { rules = [] } = {} } = webpackConfig;

// const eslintLoaders = getLoadersFromRules(rules, "use", "eslint");
// if (!eslintLoaders.length) {
//   throw new Error(
//     `missing ESLint config in webpack config: ${webpackConfigPath}`
//   );
// }
// const eslintConfig = eslintLoaders[0].options.baseConfig;
// // override ESLint rules to allow using JSX with Hyperapp
// eslintConfig.rules = Object.assign(eslintConfig.rules || {}, {
//   "react/react-in-jsx-scope": "off",
//   "no-unused-vars": [
//     "warn",
//     {
//       varsIgnorePattern: "^h$"
//     }
//   ]
// });

// const babelLoaders = getLoadersFromRules(rules, "oneOf", "babel");
// if (!babelLoaders.length) {
//   throw new Error(
//     `missing Babel config in webpack config: ${webpackConfigPath}`
//   );
// }
// const babelOptions = babelLoaders[0].options;
// // configure babel to allow using JSX with Hyperapp
// babelOptions.plugins = (babelOptions.plugins || []).concat([
//   [
//     "@babel/transform-react-jsx",
//     {
//       pragma: "h",
//       useBuiltIns: true
//     }
//   ]
// ]);

// // override config in cache
// require.cache[require.resolve(webpackConfigPath)].exports = () => webpackConfig;

// const createJestConfig = require(createJestConfigPath);
// require.cache[require.resolve(createJestConfigPath)].exports = (...args) => {
//   const jestConfig = createJestConfig(...args);
//   for (let key in jestConfig.transform) {
//     if (jestConfig.transform[key].includes("fileTransform")) {
//       jestConfig.transform[key] = require.resolve("./dummyTransform");
//     }
//   }
//   jestConfig.transformIgnorePatterns = ["node_modules/(?!hyperapp)/"];
//   return jestConfig;
// };

// // Mock React module with dummy latest version
// require.cache[require.resolve("resolve")].exports.sync = require.resolve;
// const _resolveFilename = Module._resolveFilename;
// Module._resolveFilename = (request, parent) =>
//   request === "react" ? "react" : _resolveFilename(request, parent);
// require.cache["react"] = {
//   exports: { version: "999.999.999" }
// };

// // call original react script
// require(`react-scripts/scripts/${script}.js`);

"use strict";

// Do this as the first thing so that any code reading it knows the right env.
process.env.BABEL_ENV = "development";
process.env.NODE_ENV = "development";

// const fs = require("fs");
const chalk = require("react-dev-utils/chalk");
// const loadConfigFile = require("rollup/dist/loadConfigFile");
// const path = require("path");
const rollup = require("rollup");

const {
  choosePort
  // prepareUrls
} = require("react-dev-utils/WebpackDevServerUtils");
// const openBrowser = require("react-dev-utils/openBrowser");
const paths = require("../config/paths");

// const env = getClientEnvironment(paths.publicUrlOrPath.slice(0, -1));
// const useYarn = fs.existsSync(paths.yarnLockFile);
const isInteractive = process.stdout.isTTY;

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.HOST) {
  console.log(
    chalk.cyan(
      `Attempting to bind to HOST environment variable: ${chalk.yellow(
        chalk.bold(process.env.HOST)
      )}`
    )
  );
  console.log(
    `If this was unintentional, check that you haven't mistakenly set it in your shell.`
  );
  console.log(
    `Learn more here: ${chalk.yellow("https://cra.link/advanced-config")}`
  );
  console.log();
}

// We require that you explicitly set browsers and do not fall back to
// browserslist defaults.
const { checkBrowsers } = require("react-dev-utils/browsersHelper");
checkBrowsers(paths.appPath, isInteractive)
  .then(() => {
    // We attempt to use the default port but if it is busy, we offer the user to
    // run on a different port. `choosePort()` Promise resolves to the next free port.
    return choosePort(HOST, DEFAULT_PORT);
  })
  .then(async port => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    const protocol = process.env.HTTPS === "true" ? "https" : "http";
    // const appName = require(paths.appPackageJson).name;

    // // const useTypeScript = fs.existsSync(paths.appTsConfig);
    // // const tscCompileOnError = process.env.TSC_COMPILE_ON_ERROR === "true";
    // const urls = prepareUrls(
    //   protocol,
    //   HOST,
    //   port,
    //   paths.publicUrlOrPath.slice(0, -1)
    // );

    // let userConfig;
    // try {
    //   userConfig = require(paths.appRollupConfig);
    // } catch (err) {
    //   userConfig = null;
    // }

    const { devServer } = require(paths.ownRollupConfig);

    // load the config file next to the current script;
    // the provided config object has the same effect as passing "--format es"
    // on the command line and will override the format of all outputs
    const options = devServer({ protocol, port, host: HOST });

    // loadConfigFile(, {
    //   format: "es"
    // }).then(async ({ options, warnings }) => {
    //   // "warnings" wraps the default `onwarn` handler passed by the CLI.
    //   // This prints all warnings up to this point:
    //   console.log(`We currently have ${warnings.count} warnings`);

    //   // This prints all deferred warnings
    //   warnings.flush();

    // options is an "inputOptions" object with an additional "output"
    // property that contains an array of "outputOptions".
    // The following will generate all outputs and write them to disk the same
    // way the CLI does it:
    const bundle = await rollup.rollup(options);
    await Promise.all(options.output.map(bundle.write));

    // You can also pass this directly to "rollup.watch"
    rollup.watch(options);
    // });
  });

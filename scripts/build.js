"use strict";

const loadConfigFile = require("rollup/dist/loadConfigFile");
// const path = require("path");
const rollup = require("rollup");
const paths = require("../config/paths");

// load the config file next to the current script;
// the provided config object has the same effect as passing "--format es"
// on the command line and will override the format of all outputs
// loadConfigFile(paths.appRollupConfig).then(({ options, bundle }) => {

// })
// const options = require(paths.appRollupConfig);

// rollup.rollup(options).then(() => {
//   console.log(options);

//   options.output.map(bundle.write);
// });

loadConfigFile(paths.appRollupConfig).then(async ({ options, warnings }) => {
  // "warnings" wraps the default `onwarn` handler passed by the CLI.
  // This prints all warnings up to this point:

  // This prints all deferred warnings
  warnings.flush();

  // options is an "inputOptions" object with an additional "output"
  // property that contains an array of "outputOptions".
  // The following will generate all outputs and write them to disk the same
  // way the CLI does it:
  const bundle = await rollup.rollup(options[0]);
  await Promise.all(options[0].output.map(bundle.write));

  // You can also pass this directly to "rollup.watch"
  // rollup.watch(options);
});
// options is an "inputOptions" object with an additional "output"
// property that contains an array of "outputOptions".
// The following will generate all outputs and write them to disk the same
// way the CLI does it:

// You can also pass this directly to "rollup.watch"
// rollup.watch(options);

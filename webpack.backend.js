/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/

/**
 * @itwin/backend-webpack-tools build script with additional plugins for conditional compilation.
 */

"use strict";

const chalk = require("chalk");
const webpack = require("webpack");
const { command, describe, builder } = require("@itwin/backend-webpack-tools/scripts/build");

const handler = async (argv) => {
  // Do this as the first thing so that any code reading it knows the right env.
  require("@itwin/backend-webpack-tools/scripts/utils/initialize")("production");

  const path = require("path");
  const { buildBackend, saveJsonStats } = require("@itwin/backend-webpack-tools/scripts/utils/webpackWrappers");
  const { getWebpackConfig } = require("@itwin/backend-webpack-tools/config/getWebpackConfig");

  const outDir = path.resolve(process.cwd(), argv.outDir);
  const sourceFile = path.resolve(process.cwd(), argv.source);
  const config = getWebpackConfig(sourceFile, outDir, argv.profile);

  // Conditional compilation variables.
  config.plugins.push(
    new webpack.EnvironmentPlugin({
      DEV_MODE: "",
    })
  );

  config.devtool = "source-map";

  // Start the webpack backend build
  const stats = await buildBackend(config);

  console.groupEnd();
  console.log();
  console.log(`The ${chalk.cyan(path.basename(outDir))} folder is ready to be deployed.`);

  process.exit();
};

require("yargonaut")
  .style("green")
  .style("yellow", "required")
  .style("cyan", "Positionals:")
  .helpStyle("cyan")
  .errorsStyle("red.bold");

const yargs = require("yargs");
const argv = yargs
  .showHelpOnFail(false)
  .wrap(Math.min(120, yargs.terminalWidth()))
  .usage(`\n${chalk.bold("$0")} ${chalk.yellow("<command>")}`)
  .command({ builder, command, describe, handler })
  .epilogue(
    `${chalk.cyan("For more information on a particular command, run:")}\n\n    ${chalk.bold(
      "backend-webpack-tools"
    )} ${chalk.yellow("<command>")} ${chalk.green("--help")}`
  ).argv;

import chalk from "chalk";
import cpy from "cpy";
import fs from "fs";
import os from "os";
import path from "path";
import { makeDir } from "./helpers/make-dir";
import { tryGitInit } from "./helpers/git";
import { install } from "./helpers/install";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { getOnline } from "./helpers/is-online";
import { shouldUseYarn } from "./helpers/should-use-yarn";
import { isWriteable } from "./helpers/is-writeable";

export class DownloadError extends Error {}

export async function createApp({ appPath, useNpm }: { appPath: string; useNpm: boolean }): Promise<void> {
    const template = "typescript";

    const root = path.resolve(appPath);

    if (!(await isWriteable(path.dirname(root)))) {
        console.error("The application path is not writable, please check folder permissions and try again.");
        console.error("It is likely you do not have write permissions for this folder.");
        process.exit(1);
    }

    const appName = path.basename(root);

    await makeDir(root);
    if (!isFolderEmpty(root, appName)) {
        process.exit(1);
    }

    const useYarn = useNpm ? false : shouldUseYarn();
    const isOnline = !useYarn || (await getOnline());
    const originalDirectory = process.cwd();

    const displayedCommand = useYarn ? "yarn" : "npm";
    console.log(`Creating a new React app in ${chalk.green(root)}.`);
    console.log();

    await makeDir(root);
    process.chdir(root);

    //start---
    /**
     * Otherwise, if an example repository is not provided for cloning, proceed
     * by installing from a template.
     */
    console.log(chalk.bold(`Using ${displayedCommand}.`));
    /**
     * Create a package.json for the new project.
     */
    const packageJson = {
        name: appName,
        version: "0.1.0",
        private: true,
        scripts: {
            dev: "webpack serve --config ./config/webpack/dev.js",
            build: "webpack build --config ./config/webpack/prod.js",
            "build:az": "webpack build --config ./config/webpack/prod.analyzer.js",
            lint: "eslint .",
            prettier: "prettier --write '**/*' --config ./.prettierrc",
            test: "jest -c ./config/jest/jest.json",
        },
    };
    /**
     * Write it to disk.
     */
    fs.writeFileSync(path.join(root, "package.json"), JSON.stringify(packageJson, null, 2) + os.EOL);
    /**
     * These flags will be passed to `install()`.
     */
    const installFlags = { useYarn, isOnline };
    /**
     * Default dependencies.
     */
    const dependencies = ["react", "react-dom"];
    /**
     * Default devDependencies.
     */
    const devDependencies = [
        "webpack",
        "webpack-bundle-analyzer",
        "webpack-cli",
        "webpack-dev-server",
        "webpack-merge",
        "html-webpack-plugin",
        "copy-webpack-plugin",
        "css-loader",
        "style-loader",
        "ts-loader",
    ];
    // babel
    devDependencies.push("@babel/core", "@babel/preset-env", "@babel/preset-react");
    // eslint
    devDependencies.push(
        "eslint@7",
        "eslint-plugin-react",
        "eslint-plugin-react-hooks",
        "@typescript-eslint/eslint-plugin",
        "@typescript-eslint/parser",
    );
    // prettier
    devDependencies.push("prettier", "eslint-config-prettier", "eslint-plugin-prettier");
    // jest
    devDependencies.push("jest", "ts-jest", "@types/jest", "@testing-library/react", "@testing-library/react-hooks");
    /**
     * TypeScript projects will have type definitions and other devDependencies.
     */
    devDependencies.push("typescript", "@types/react", "@types/react-dom");
    /**
     * Install package.json dependencies if they exist.
     */
    if (dependencies.length) {
        console.log();
        console.log("Installing dependencies:");
        for (const dependency of dependencies) {
            console.log(`- ${chalk.cyan(dependency)}`);
        }
        console.log();

        await install(root, dependencies, installFlags);
    }
    /**
     * Install package.json devDependencies if they exist.
     */
    if (devDependencies.length) {
        console.log();
        console.log("Installing devDependencies:");
        for (const devDependency of devDependencies) {
            console.log(`- ${chalk.cyan(devDependency)}`);
        }
        console.log();

        const devInstallFlags = { devDependencies: true, ...installFlags };
        await install(root, devDependencies, devInstallFlags);
    }
    console.log();
    /**
     * Copy the template files to the target directory.
     */
    await cpy("**", root, {
        parents: true,
        cwd: path.join(__dirname, "templates", template),
        rename: (name) => {
            switch (name) {
                case "babelrc":
                case "gitignore":
                case "prettierignore":
                case "prettierrc":
                case "eslintignore":
                case "eslintrc.json": {
                    return ".".concat(name);
                }
                case "README-template.md": {
                    return "README.md";
                }
                default: {
                    return name;
                }
            }
        },
    });
    //---end

    if (tryGitInit(root)) {
        console.log("Initialized a git repository.");
        console.log();
    }

    let cdpath: string;
    if (path.join(originalDirectory, appName) === appPath) {
        cdpath = appName;
    } else {
        cdpath = appPath;
    }

    console.log(`${chalk.green("Success!")} Created ${appName} at ${appPath}`);
    console.log("Inside that directory, you can run several commands:");
    console.log();
    console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? "" : "run "}dev`));
    console.log("    Starts the development server.");
    console.log();
    console.log(chalk.cyan(`  ${displayedCommand} ${useYarn ? "" : "run "}build`));
    console.log("    Builds the app for production.");
    console.log();
    console.log();
    console.log("We suggest that you begin by typing:");
    console.log();
    console.log(chalk.cyan("  cd"), cdpath);
    console.log(`  ${chalk.cyan(`${displayedCommand} ${useYarn ? "" : "run "}dev`)}`);
    console.log();
}

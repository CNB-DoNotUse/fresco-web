'use strict'

const yargs = require('yargs');
const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

function buildDocker(buildConfig) {
    copyFile(normalizePath('.dockerignore'), normalizePath('../.dockerignore'));
    copyFile(normalizePath(`${buildConfig}/Dockerfile`), normalizePath('../Dockerfile'));
    copyFile(normalizePath(`${buildConfig}/docker-compose.yml`), normalizePath('../docker-compose.yml'));
    copyFile(normalizePath(`${buildConfig}/docker.json`), normalizePath('../config/docker.json'));

    runCommand('docker build -t fresco-web .');
}

function clean() {
    deleteFile(normalizePath('../.dockerignore'));
    deleteFile(normalizePath('../Dockerfile'));
    deleteFile(normalizePath('../docker-compose.yml'));
    deleteFile(normalizePath('../config/docker.json'));
}

function normalizePath(filePath) {
    return path.join(__dirname, filePath);
}

function copyFile(from, to) {
    console.log(`Copying ${from} to ${to}`);
    fs.writeFileSync(to, fs.readFileSync(from));
}

function deleteFile(file) {
    if (fileExists(file)) {
        console.log(`Deleting ${file}`);
        fs.unlinkSync(file);
    }
    else {
        console.log(`${file} doesn't exist. Skipping`)
    }
}

function fileExists(file) {
    try {
        fs.accessSync(file);
        return true;
    }
    catch (ex) {
        return false;
    }
}

function runCommand(command) {
    console.log(`Running ${command}`)
    child_process.execSync(command, {
        cwd: normalizePath('../'),
        stdio: 'inherit'
    });
}

function main() {
    let argv = yargs.argv;

    let buildConfig = argv._[0];

    if (!buildConfig) {
        console.log("Please specify a build configuration");
    }
    else if (buildConfig == 'clean') {
        clean();
    }
    else {
        buildDocker(buildConfig);
    }
}

main();

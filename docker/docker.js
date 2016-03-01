'use strict'

const yargs = require('yargs');
const path = require('path');
const fs = require('fs');

function main() {
    let argv = yargs.argv;

    if (argv._.indexOf('nobuild') !== -1) {
        copyFiles('nobuild');
    }
    else if (argv._.indexOf('clean') !== -1) {
        clean();
    }
    else {
        copyFiles('dobuild');
    }
}

function copyFiles(type) {
    let srcDockerPath = path.join(__dirname, type);
    let dstDockerPath = path.join(__dirname, '../');

    console.log(`Copying docker files from ${srcDockerPath} to ${dstDockerPath}`);
    copy(path.join(srcDockerPath, 'Dockerfile'), path.join(dstDockerPath, 'Dockerfile'));
    copy(path.join(srcDockerPath, 'docker-compose.yml'), path.join(dstDockerPath, 'docker-compose.yml'));

    let dockerConfig = {
        "REDIS": {
          "SESSIONS": "redis"
        }
    }

    let dockerConfigContents = JSON.stringify(dockerConfig, null, 4);

    let dockerConfigFile = path.join(__dirname, '../config/docker.json');

    console.log(`Writing config:\n${dockerConfigContents}\nto ${dockerConfigFile}`)

    fs.writeFileSync(dockerConfigFile, dockerConfigContents);
}

function copy(from, to) {
    fs.createReadStream(from).pipe(fs.createWriteStream(to));
}

function clean() {
    let dockerfile = path.join(__dirname, '../Dockerfile');
    let dockerComposeFile = path.join(__dirname, '../docker-compose.yml');
    let dockerConfigFile = path.join(__dirname, '../config/docker.json');

    console.log(`Removing ${dockerfile}`);
    fs.unlinkSync(dockerfile);

    console.log(`Removing ${dockerComposeFile}`);
    fs.unlinkSync(dockerComposeFile);

    console.log(`Removing ${dockerConfigFile}`);
    fs.unlinkSync(dockerConfigFile);
}

main();

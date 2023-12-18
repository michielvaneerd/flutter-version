const fs = require('fs');
const { execSync } = require('child_process');
const utils = require('../utils');

const arguments = [
    {
        name: 'Version',
        optional: true
    }
];

/**
 * Switches the active Flutter version on the system. If we are in the root of a Flutter project, it also writes this into the flutter-version.json file.
 */
function execSwitch(argv, flutterVersionsDir, flutterSymlink) {

    const isInRootOfFlutterProject = utils.isInRootOfFlutterProject();
   
    if (!isInRootOfFlutterProject && !argv.length) {
        utils.exitOnError('The switch command requires a version or channel argument if you are not in the root of a Flutter project.');
    }
    let newDir = null;
    if (argv.length) {
        const newVersion = argv[0];
        newDir = `${flutterVersionsDir}/flutter-${newVersion}`;
    } else {
        const projectVersionAndChannel = utils.getProjectVersionAndChannel();
        if (!projectVersionAndChannel) {
            // No .flutter-version.json, so now we are going to write this file with the current active Flutter version information.
            newDir = utils.getPathOfSymlink(flutterSymlink);
        } else {
            newDir = `${flutterVersionsDir}/${projectVersionAndChannel.dir}`;
        }
    }

    if (!fs.existsSync(newDir)) {
        utils.exitOnError(`Directory ${newDir} doesn't exist.`);
    }
    const stat = fs.lstatSync(flutterSymlink, { throwIfNoEntry: false });
    if (stat && stat.isSymbolicLink()) {
        execSync(`unlink ${flutterSymlink}`);
    }
    if (fs.existsSync(flutterSymlink)) {
        utils.exitOnError(`File ${flutterSymlink} does exist and is not a symbolic link.`);
    }
    execSync(`ln -s ${newDir} ${flutterSymlink}`);

    const globalActiveVersionAndChannel = utils.getGlobalActiveVersionAndChannel();
    const realPath = utils.getPathOfSymlink(flutterSymlink);
    globalActiveVersionAndChannel.dir = realPath.substring(realPath.lastIndexOf('/') + 1);

    const message = [`Flutter version ${globalActiveVersionAndChannel.version} (${globalActiveVersionAndChannel.channel}) activated, path = ${globalActiveVersionAndChannel.dir}`];

    if (isInRootOfFlutterProject) {
        fs.writeFileSync('.flutter-version.json', JSON.stringify(globalActiveVersionAndChannel, null, 4));
        message.push('also written into the project .flutter-version.json file');
    }
    console.log(message.join(' - '));
    process.exit();
}

module.exports = {
    execSwitch,
    description: '',
    arguments
};
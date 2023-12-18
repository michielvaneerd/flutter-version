const fs = require('fs');
const { execSync } = require('child_process');
const os = require('os');
const utils = require('./utils');
const path = require('path');

const homeDir = os.homedir();
const tmpDir = os.tmpdir();
const paths = utils.initPaths(homeDir);
const isInRootOfFlutterProject = utils.isInRootOfFlutterProject();


const knownChannels = ['stable', 'beta', 'master'];

const availableCommands = {
    'install': {
        description: 'Install Flutter version',
        func: execInstall
    },
    'uninstall': {
        description: 'Uninstall Flutter version',
        func: execUninstall
    },
    'list': {
        description: 'Lists all available Flutter versions',
        func: execList
    },
    'switch': {
        description: 'Switches to a specific Flutter version. It also updates the .flutter-version.json file if you are in the root of a Flutter project.',
        examples: [
            'switch VERSION - Switches to a specific Flutter version',
            `switch - Without VERSION argument - can be used only when inside a Flutter project directory - switches to the Flutter version that is written in the .flutter-version.json file, or, if this file doesn't exist, to the current active Flutter version`,
        ],
        func: execSwitch
    },
    'is-versioned': {
        description: 'Checks if the current active Flutter version points to a versioned directory',
        func: execIsVersioned
    },
    'flutter-path': {
        description: 'Gets the path of the current active Flutter version',
        func: execFlutterPath
    }
};

function exitWithHelpText(message) {
    console.error(`${message}`);
    console.group();
    for (var key in availableCommands) {
        console.log(`${key} - ${availableCommands[key].description}`);
        if (availableCommands[key].examples) {
            console.group();
            availableCommands[key].examples.forEach(function (example) {
                console.log(example);
            });
            console.groupEnd();
        }
    }
    console.groupEnd();
    process.exit(1);
}

if (process.argv.length <= 2 || !(process.argv[2] in availableCommands)) {
    exitWithHelpText('Missing or unknown command.');
}

(async function () {

    const command = process.argv[2];
    try {
        await availableCommands[command].func();
        console.log('OK');
    } catch (err) {
        console.error(err);
    }

}());



/**
 * Gets the path of the current active Flutter command line client.
 * @returns {String} Current active Flutter command line client.
 */
function execFlutterPath() {
    console.log(`${utils.getPathOfSymlink(paths.flutterSymlink)}/bin/flutter`);
    process.exit();
}

/**
 * Checks if the current active Flutter version points to a versioned directory
 * @returns {Boolean | String} True if we are currently on a versioned Flutter directory, false if we aren't and an error String in case of some error.
 */
function execIsVersioned() {
    if (!utils.isSymlink(paths.flutterSymlink)) {
        utils.exitOnError('Cannot get symbolic link');
    }
    const realPath = utils.getPathOfSymlink(paths.flutterSymlink);
    console.log(utils.isVersionedPath(realPath) ? 1 : 0);
    process.exit();
}

/**
 * Install specific Flitter version
 */
async function execInstall() {
    const tag = process.argv[3]; // stable: 3.16.4 and beta: 3.18.0-0.2.pre (include PRE!)
    const channel = process.argv[4] ?? 'stable'; // can be beta or stable
    if (['stable', 'beta'].indexOf(channel) === -1) {
        utils.exitOnError('Invalid channel argument.');
    }

    // See for SDK archive: https://docs.flutter.dev/release/archive?tab=macos

    const arch = os.arch();
    const url = `https://storage.googleapis.com/flutter_infra_release/releases/${channel}/macos/flutter_macos_${arch === 'arm64' ? 'arm64_' : ''}${tag}-${channel}.zip`;
    const zipFile = await utils.download(url, tmpDir, true);
    await utils.unzip(zipFile, tmpDir, true);
    // The ZIP file is unzipped into /tmp/flutter, so now rename this to the tagged directory name and move to the flutter versions dir
    fs.renameSync(path.join(tmpDir, 'flutter'), path.join(paths.flutterVersionsDir, `flutter-${tag}`));
    fs.unlinkSync(zipFile);
    process.exit();
}

function execUninstall() {
    // TODO: check if current active one is the one to delete?
    const tag = process.argv[3];
    const file = path.join(paths.flutterVersionsDir, `flutter-${tag}`);
    if (!fs.existsSync(file)) {
        utils.exitOnError(`File ${file} does not exist.`);
    }
    fs.rmSync(file, { recursive: true, force: true });
}

/**
 * Lists all Flutter versions.
 */
function execList() {
    const globalActiveVersionAndChannel = utils.getGlobalActiveVersionAndChannel();
    const projectVersionAndChannel = isInRootOfFlutterProject ? utils.getProjectVersionAndChannel() : null;
    const files = fs.readdirSync(paths.flutterVersionsDir).filter(function (file) {
        return file.startsWith('flutter-');
    }).map(function (file) {
        return file.substring(file.indexOf('-') + 1);
    });
    files.sort();
    const rows = [];
    for (const version of files) {
        const dir = `flutter-${version}`;
        const versionAndChannel = utils.getFlutterVersionAndChannel(`${paths.flutterVersionsDir}/${dir}`);
        const row = new utils.OutputRow(
            dir,
            version,
            versionAndChannel.version,
            versionAndChannel.channel,
            versionAndChannel.version === globalActiveVersionAndChannel.version && versionAndChannel.channel === globalActiveVersionAndChannel.channel,
            projectVersionAndChannel && projectVersionAndChannel.version === versionAndChannel.version && projectVersionAndChannel.channel === versionAndChannel.channel,
            null
        );
        if (knownChannels.indexOf(version) !== -1) {
            if (version !== versionAndChannel.channel) {
                row.mismatch = `Directory doesn't match channel ${versionAndChannel.channel}`;
            }
        } else {
            if (version !== versionAndChannel.version) {
                row.mismatch = `Directory doesn't match version ${versionAndChannel.version}`;
            }
        }
        rows.push(row);
    }
    console.table(rows);
    process.exit();
}

/**
 * Switches the active Flutter version on the system. If we are in the root of a Flutter project, it also writes this into the flutter-version.json file.
 */
function execSwitch() {
    if (!isInRootOfFlutterProject && process.argv.length < 4) {
        utils.exitOnError('The switch command requires a version or channel argument if you are not in the root of a Flutter project.');
    }
    let newDir = null;
    if (process.argv.length >= 4) {
        const newVersion = process.argv[3];
        newDir = `${paths.flutterVersionsDir}/flutter-${newVersion}`;
    } else {
        const projectVersionAndChannel = utils.getProjectVersionAndChannel();
        if (!projectVersionAndChannel) {
            // No .flutter-version.json, so now we are going to write this file with the current active Flutter version information.
            newDir = utils.getPathOfSymlink(paths.flutterSymlink);
        } else {
            newDir = `${paths.flutterVersionsDir}/${projectVersionAndChannel.dir}`;
        }
    }

    if (!fs.existsSync(newDir)) {
        utils.exitOnError(`Directory ${newDir} doesn't exist.`);
    }
    const stat = fs.lstatSync(paths.flutterSymlink, { throwIfNoEntry: false });
    if (stat && stat.isSymbolicLink()) {
        execSync(`unlink ${paths.flutterSymlink}`);
    }
    if (fs.existsSync(paths.flutterSymlink)) {
        utils.exitOnError(`File ${paths.flutterSymlink} does exist and is not a symbolic link.`);
    }
    execSync(`ln -s ${newDir} ${paths.flutterSymlink}`);

    const globalActiveVersionAndChannel = utils.getGlobalActiveVersionAndChannel();
    const realPath = utils.getPathOfSymlink(paths.flutterSymlink);
    globalActiveVersionAndChannel.dir = realPath.substring(realPath.lastIndexOf('/') + 1);

    const message = [`Flutter version ${globalActiveVersionAndChannel.version} (${globalActiveVersionAndChannel.channel}) activated, path = ${globalActiveVersionAndChannel.dir}`];

    if (isInRootOfFlutterProject) {
        fs.writeFileSync('.flutter-version.json', JSON.stringify(globalActiveVersionAndChannel, null, 4));
        message.push('also written into the project .flutter-version.json file');
    }
    console.log(message.join(' - '));
    process.exit();
}

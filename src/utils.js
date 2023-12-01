const fs = require('fs');
const { execSync } = require('child_process');

const matchVersionOutputReg = /Flutter\s([\d\.]+)/;
const matchChannelOutputReg = /\schannel\s(stable|beta|master)\s/;
const matchVersionAppendix = /flutter\-([\d\.]+$)/;

function exitOnError(message, errorCode = 1) {
    log(`ERROR: ${message}`);
    process.exit(errorCode);
}

/**
 * Writes a message to the console.
 * @param {Object} message Message to log.
 */
function log(message) {
    console.log(message);
}

/**
 * Checks and initializes the `flutterVersionsDir` and `flutterSymlink` paths. These can be overridden with the `~/flutter-version.json` file.
 * @param {String} homeDir Home directory.
 * @returns {Object} Object containing the `flutterVersionsDir` and `flutterSymlink` paths.
 */
function initPaths(homeDir) {
    const systemConfig = {
        flutterVersionsDir: `${homeDir}/flutter-versions`,
        flutterSymlink: `${homeDir}/flutter`
    };
    if (fs.existsSync(`${homeDir}/.flutter-version.json`)) {
        try {
            const json = JSON.parse(fs.readFileSync(`${homeDir}/.flutter-version.json`, 'utf8'));
            if (json.flutterVersionsDir) {
                systemConfig.flutterVersionsDir = json.flutterVersionsDir.replace("~", homeDir);
            }
            if (json.flutterSymlink) {
                systemConfig.flutterSymlink = json.flutterSymlink.replace("~", homeDir);
            }
        } catch (ex) {
            exitOnError(ex.toString());
        }
    }
    if (!fs.existsSync(systemConfig.flutterVersionsDir)) {
        exitOnError(`Cannot find ${systemConfig.flutterVersionsDir}. Create this directory and add your Flutter archives to this directory.`);
    }
    return systemConfig;
}

/**
 * Checks whether we are in the root of a Flutter project directory.
 * @returns {Boolean} Whether we are in the root of a Flutter project directory.
 */
function isInRootOfFlutterProject() {
    return fs.existsSync('pubspec.yaml');
}

/**
 * Gets path of the ~/flutter symlink.
 * @returns {String} Path of the symlink.
 */
function getPathOfSymlink(flutterSymlink) {
    return fs.readlinkSync(flutterSymlink);
}

/**
 * Checks whether the given path is a symlink
 * @param {String} flutterSymlink The path to check.
 * @returns {Boolean} True if this is a symlink
 */
function isSymlink(flutterSymlink) {
    const stat = fs.lstatSync(flutterSymlink, { throwIfNoEntry: false });
    return stat && stat.isSymbolicLink();
}

/**
 * Returns the current system Flutter version, e.g. the output of the `flutter --version` command.
 * @returns {Object} Flutter version and channel.
 */
function getGlobalActiveVersionAndChannel() {
    return getFlutterVersionAndChannel();
}

/**
 * Checks whether the path is versioned, like flutter-3.16.2
 * @param {String} path Path to check.
 * @returns True if this a versioned path.
 */
function isVersionedPath(path) {
    const match = matchVersionAppendix.exec(path);
    return match && match.length >= 2 && match[1].trim() !== '';
}

/**
 * Returns the Flutter version of this Flutter directory.
 * @param {String|null} path The Flutter directory.
 * @returns {Object} Flutter version and channel.
 */
function getFlutterVersionAndChannel(path) {
    const realPath = path ? `${path}/bin/flutter --version` : 'flutter --version';
    const output = execSync(realPath);
    const versionMatch = matchVersionOutputReg.exec(output);
    const channelMatch = matchChannelOutputReg.exec(output);
    if (!versionMatch || versionMatch.length < 2) {
        exitOnError('Cannot get Flutter version from flutter --version command');
    }
    if (!channelMatch || channelMatch.length < 2) {
        exitOnError('Cannot get Flutter channel from flutter --version command');
    }
    return {
        version: versionMatch[1].trim(),
        channel: channelMatch[1].trim()
    };
}

class OutputRow {
    constructor(directory, version, channel, active, project, mismatch) {
        this.directory = directory;
        this.version = version;
        this.channel = channel;
        this.active = active;
        this.project = project;
        this.mismatch = mismatch;
    }
}

/**
 * Gets the projects Flutter version and channel that is written into yhe .flutter-version.json file.
 * @returns {Object | null} Flutter version and channel that is written in the .flutter-version.json file or null if this file doesn't exist.
 */
function getProjectVersionAndChannel() {
    return fs.existsSync('.flutter-version.json') ? JSON.parse(fs.readFileSync('.flutter-version.json', 'utf8').trim()) : null;
}

module.exports = {
    exitOnError,
    log,
    getFlutterVersionAndChannel,
    getGlobalActiveVersionAndChannel,
    getProjectVersionAndChannel,
    initPaths,
    isInRootOfFlutterProject,
    getPathOfSymlink,
    isSymlink,
    isVersionedPath,
    OutputRow
}
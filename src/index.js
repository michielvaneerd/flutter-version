const fs = require('fs');
const { execSync } = require("child_process");
const homeDir = require('os').homedir();

function exit(message) {
    console.log(message);
    process.exit(0);
}

const matchReg = /Flutter\s([\d\.]+)/;

let flutterVersionsDir = `${homeDir}/flutter-versions`;
let flutterSymlink = `${homeDir}/flutter`;

function getFlutterVersion(path) {
    const versionMatch = matchReg.exec(execSync(path ? `${path}/bin/flutter --version` : 'flutter --version'));
    if (!versionMatch || versionMatch.length < 2) {
        exit('Cannot get Flutter version from flutter --version command');
    }
    return versionMatch[1].trim();
}

if (!fs.existsSync('pubspec.yaml')) {
    exit('You are not in the root of a Flutter project.');
}

if (fs.existsSync(`${homeDir}/.flutter-version.json`)) {
    try {
        const json = JSON.parse(fs.readFileSync(`${homeDir}/.flutter-version.json`, 'utf8'));
        if (json.flutterVersionsDir) {
            flutterVersionsDir = json.flutterVersionsDir.replace("~", homeDir);
        }
        if (json.flutterSymlink) {
            flutterSymlink = json.flutterSymlink.replace("~", homeDir);
        }
    } catch (ex) {
        exit(ex.toString());
    }
}

if (!fs.existsSync(flutterVersionsDir)) {
    exit(`Cannot find ${flutterVersionsDir}. Create this directory and add your Flutter archives to this directory.`);
}

let newVersion = null;

// Read current project version
const projectVersion = fs.existsSync('.flutter-version') ? fs.readFileSync('.flutter-version', 'utf8').trim() : null;

if (process.argv.length > 2) {

    switch (process.argv[2]) {
        case 'is-default':
            {
                const currentBinaryVersion = getFlutterVersion();
                const defaultBinaryVersion = getFlutterVersion(`${flutterVersionsDir}/flutter`);
                if (currentBinaryVersion == defaultBinaryVersion) {
                    exit(`Yes you are currently running the default Flutter version ${currentBinaryVersion}`);
                } else {
                    exit(`No, your current Flutter version ${currentBinaryVersion} is NOT the default Flutter version ${defaultBinaryVersion}`);
                }
            }
            break;
        case 'check':
            break;
        case 'ls':
        case 'list':
            const currentDefaultVersion = fs.existsSync(`${flutterVersionsDir}/flutter`) ? getFlutterVersion(`${flutterVersionsDir}/flutter`) : null;
            const currentBinaryVersion = getFlutterVersion();
            const files = fs.readdirSync(flutterVersionsDir).filter(function(file) {
                return file.startsWith('flutter-');
            }).concat([currentDefaultVersion]).map(function(file) {
                const version = file.substring(file.indexOf('-') + 1);
                let versionString = version;
                if (version == currentBinaryVersion) {
                    versionString += ' - current system version';
                }
                if (version == projectVersion) {
                    versionString += ' - current project version';
                }
                return versionString;
            });
            exit(files);
            break;
        default:
            {
                const arg = process.argv[2].trim();

                if (arg === 'switch') {
                    // Make flutter binary version the same as the project version.
                    const currentBinaryVersion = getFlutterVersion();
                    if (currentBinaryVersion == projectVersion) {
                        newVersion = 'default';
                    } else {
                        newVersion = projectVersion;
                    }
                } else {
                    newVersion = arg;
                }

                const filePath = `${flutterVersionsDir}/` + (newVersion === 'default' ? 'flutter' : `flutter-${newVersion}`);

                if (!fs.existsSync(filePath)) {
                    exit(`Cannot find path ${filePath} for Flutter version ${newVersion}`);
                }

                const stat = fs.lstatSync(flutterSymlink, { throwIfNoEntry: false });
                if (stat && stat.isSymbolicLink()) {
                    execSync(`unlink ${flutterSymlink}`);
                }
                execSync(`ln -s ${filePath} ${flutterSymlink}`);
            }
            break;
    }
}

// The real Flutter version when running flutter --version
const binaryVersion = getFlutterVersion();

if (newVersion && newVersion !== 'default') {
    if (newVersion != binaryVersion) {
        exit(`The new version ${newVersion} is different than the binary version ${binaryVersion}! Probably because you ran flutter upgrade in a specific Flutter version! Fix this before continuing!`);
    }
}

fs.writeFileSync('.flutter-version', binaryVersion);

console.log(`Written current Flutter version ${binaryVersion} to .flutter-version`);

if (binaryVersion != projectVersion) {
    console.log(`Switched from ${projectVersion} to ${binaryVersion} - make sure to run flutter pub get!`);
}
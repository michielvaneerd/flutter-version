const fs = require('fs');
const { execSync } = require("child_process");
const homeDir = require('os').homedir();

function exit(message) {
    console.log(message);
    process.exit(0);
}

let flutterVersionsDir = `${homeDir}/flutter-versions`;

if (fs.existsSync(`${homeDir}/.flutter-version.json`)) {
    try {
        const json = JSON.parse(fs.readFileSync(`${homeDir}/.flutter-version.json`, 'utf8'));
        if (json.flutterVersionsDir) {
            flutterVersionsDir = json.flutterVersionsDir;
        }
    } catch (ex) {
        exit(ex.toString());
    }
}

if (!fs.existsSync(flutterVersionsDir)) {
    exit(`Cannot find ${flutterVersionsDir}. Create this directory and add your Flutter archives to this directory.`);
}

let newVersion = null;

if (process.argv.length === 3) {
    // Switch version.
    newVersion = process.argv[2].trim();
    
    const filePath = `${flutterVersionsDir}/` + (newVersion === 'latest' ? 'flutter' : `flutter-${newVersion}`);

    if (!fs.existsSync(filePath)) {
        exit(`Cannot find path ${filePath} for Flutter version ${newVersion}`);
    }

    const stat = fs.lstatSync(`${homeDir}/flutter`, {throwIfNoEntry: false});
    if (stat && stat.isSymbolicLink()) {
        execSync(`unlink ${homeDir}/flutter`);
    }
    execSync(`ln -s ${filePath} ${homeDir}/flutter`);
}

if (!fs.existsSync('pubspec.yaml')) {
    exit('You are not in the root of a Flutter project.');
}

// Read current project version
const projectVersion = fs.readFileSync('.flutter-version', 'utf8').trim();

// Get current active Flutter version
const versionMatch = /Flutter\s([\d\.]+)/.exec(execSync("flutter --version"));
if (!versionMatch || versionMatch.length < 2) {
    exit('Cannot get Flutter version from flutter --version command');
}

const binaryVersion = versionMatch[1].trim();

if (newVersion && newVersion !== 'latest') {
    if (newVersion != binaryVersion) {
        exit(`The new version ${newVersion} is different than the binary version ${binaryVersion}! Probably because you ran flutter upgrade in a specific Flutter version!`);
    }
}

fs.writeFileSync('.flutter-version', binaryVersion);

console.log(`Written current Flutter version ${binaryVersion} to .flutter-version`);

if (binaryVersion != projectVersion) {
    console.log(`Switched from ${projectVersion} to ${binaryVersion} - make sure to run flutter pub get!`);
}
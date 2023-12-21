import * as fs from 'fs';
import { execSync } from 'child_process';
import * as utils from '../utils.js';
export const description = 'Switch between installed Flutter versions';
export async function execSwitch(argv, flutterVersionsDir, flutterSymlink) {
    const isInRootOfFlutterProject = utils.isInRootOfFlutterProject();
    if (!isInRootOfFlutterProject && !argv.length) {
        utils.exitOnError('The switch command requires a version or channel argument if you are not in the root of a Flutter project.');
    }
    let newDir = null;
    if (argv.length) {
        const newVersion = argv[0];
        newDir = `${flutterVersionsDir}/flutter-${newVersion}`;
    }
    else {
        const projectVersionInfo = utils.getProjectVersionInfo();
        if (!projectVersionInfo) {
            newDir = utils.getPathOfSymlink(flutterSymlink);
        }
        else {
            newDir = `${flutterVersionsDir}/${projectVersionInfo.dir}`;
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
    const globalActiveVersionInfo = utils.getGlobalActiveVersionInfo();
    const realPath = utils.getPathOfSymlink(flutterSymlink);
    globalActiveVersionInfo.dir = realPath.substring(realPath.lastIndexOf('/') + 1);
    const message = [`Flutter version ${globalActiveVersionInfo.version} (${globalActiveVersionInfo.channel}) activated, path = ${globalActiveVersionInfo.dir}`];
    if (isInRootOfFlutterProject) {
        fs.writeFileSync('.flutter-version.json', JSON.stringify(globalActiveVersionInfo, null, 4));
        message.push('also written into the project .flutter-version.json file');
    }
    console.log(message.join(' - '));
    process.exit();
}

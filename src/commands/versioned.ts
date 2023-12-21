import * as fs from 'fs';
import * as utils from '../utils.js';

/**
 * Checks whether the given path is a symlink.
 * @param flutterSymlink The path to check.
 */
function isSymlink(flutterSymlink: string): boolean {
    const stat = fs.lstatSync(flutterSymlink, { throwIfNoEntry: false });
    return stat !== undefined && stat.isSymbolicLink();
}

/**
 * Description of the `versioned` command.
 */
export const description = 'Checks whether the active Flutter is a versioned one';

/**
 * Checks whether the current active Flutter is a versioned one.
 * 
 * There are 2 kind of Flutter versions:
 * 1. Versioned - for example `flutter-3.13.9` or `flutter-3.18.0.pre` - these are fixed releases and cannot be upgraded.
 * 2. Unversioned - for example `flutter-stable` or `flutter-beta` - these are rolling releases and can be upgraded.
 * 
 * @param flutterSymlink The Flutter symlink path.
 */
export async function execVersioned(flutterSymlink: string) {
    if (!isSymlink(flutterSymlink)) {
        utils.exitOnError('Cannot get symbolic link');
    }
    const realPath = utils.getPathOfSymlink(flutterSymlink);
    console.log(utils.isVersionedPath(realPath) ? 1 : 0);
    process.exit();
}

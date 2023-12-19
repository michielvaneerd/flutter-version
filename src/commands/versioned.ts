import * as utils from '../utils.js';

/**
 * Checks if the current active Flutter version points to a versioned directory
 */
export function execVersioned(flutterSymlink: string): void {
    if (!utils.isSymlink(flutterSymlink)) {
        utils.exitOnError('Cannot get symbolic link');
    }
    const realPath = utils.getPathOfSymlink(flutterSymlink);
    console.log(utils.isVersionedPath(realPath) ? 1 : 0);
    process.exit();
}

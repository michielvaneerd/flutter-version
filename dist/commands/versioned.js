import * as utils from '../utils.js';
/**
 * Checks if the current active Flutter version points to a versioned directory
 * @returns {Boolean | String} True if we are currently on a versioned Flutter directory, false if we aren't and an error String in case of some error.
 */
export function execVersioned(flutterSymlink) {
    if (!utils.isSymlink(flutterSymlink)) {
        utils.exitOnError('Cannot get symbolic link');
    }
    const realPath = utils.getPathOfSymlink(flutterSymlink);
    console.log(utils.isVersionedPath(realPath) ? 1 : 0);
    process.exit();
}

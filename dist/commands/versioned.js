import * as fs from 'fs';
import * as utils from '../utils.js';
function isSymlink(flutterSymlink) {
    const stat = fs.lstatSync(flutterSymlink, { throwIfNoEntry: false });
    return stat !== undefined && stat.isSymbolicLink();
}
export const description = 'Checks whether the active Flutter is a versioned one';
export async function execVersioned(flutterSymlink) {
    if (!isSymlink(flutterSymlink)) {
        utils.exitOnError('Cannot get symbolic link');
    }
    const realPath = utils.getPathOfSymlink(flutterSymlink);
    console.log(utils.isVersionedPath(realPath) ? 1 : 0);
    process.exit();
}

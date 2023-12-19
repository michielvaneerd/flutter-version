import * as utils from '../utils.js';

/**
 * Gets the path of the current active Flutter command line client.
 */
export async function execPath(flutterSymlink: string) {
    console.log(`${utils.getPathOfSymlink(flutterSymlink)}/bin/flutter`);
    process.exit();
}
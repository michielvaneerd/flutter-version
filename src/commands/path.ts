import * as utils from '../utils.js';

/**
 * Gets the path of the current active Flutter command line client.
 */
export function execPath(flutterSymlink: string): void {
    console.log(`${utils.getPathOfSymlink(flutterSymlink)}/bin/flutter`);
    process.exit();
}
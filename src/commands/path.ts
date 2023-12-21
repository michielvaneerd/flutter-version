import * as utils from '../utils.js';

/**
 * Description of the `path` command.
 */
export const description = 'Returns path of active Flutter version';

/**
 * Gets the path of the current active Flutter command line client.
 */
export async function execPath(flutterSymlink: string) {
    console.log(`${utils.getPathOfSymlink(flutterSymlink)}/bin/flutter`);
    process.exit();
}
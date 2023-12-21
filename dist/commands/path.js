import * as utils from '../utils.js';
export const description = 'Returns path of active Flutter version';
export async function execPath(flutterSymlink) {
    console.log(`${utils.getPathOfSymlink(flutterSymlink)}/bin/flutter`);
    process.exit();
}

const utils = require('../utils');

/**
 * Gets the path of the current active Flutter command line client.
 * @returns {String} Current active Flutter command line client.
 */
function execPath(flutterSymlink) {
    console.log(`${utils.getPathOfSymlink(flutterSymlink)}/bin/flutter`);
    process.exit();
}

exports.execPath = execPath;
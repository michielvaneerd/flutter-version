const fs = require('fs');
const path = require('path');
const utils = require('../utils');

function execUninstall(argv, flutterVersionsDir) {
    const tag = argv[0];
    const file = path.join(flutterVersionsDir, `flutter-${tag}`);
    if (!fs.existsSync(file)) {
        utils.exitOnError(`File ${file} does not exist.`);
    }
    fs.rmSync(file, { recursive: true, force: true });
}

module.exports = {
    execUninstall
};
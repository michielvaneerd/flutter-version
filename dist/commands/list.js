import * as fs from 'fs';
import * as utils from '../utils.js';
import constants from '../constants.json' with { type: 'json' };
/**
 * Lists all Flutter versions.
 */
export function execList(flutterVersionsDir) {
    const globalActiveVersionAndChannel = utils.getGlobalActiveVersionAndChannel();
    const projectVersionAndChannel = utils.isInRootOfFlutterProject() ? utils.getProjectVersionAndChannel() : null;
    const files = fs.readdirSync(flutterVersionsDir).filter(function (file) {
        return file.startsWith('flutter-');
    }).map(function (file) {
        return file.substring(file.indexOf('-') + 1);
    });
    files.sort();
    const rows = [];
    for (const version of files) {
        const dir = `flutter-${version}`;
        const versionAndChannel = utils.getFlutterVersionAndChannel(`${flutterVersionsDir}/${dir}`);
        const row = new utils.OutputRow(dir, version, versionAndChannel.version, versionAndChannel.channel, versionAndChannel.version === globalActiveVersionAndChannel.version && versionAndChannel.channel === globalActiveVersionAndChannel.channel, projectVersionAndChannel && projectVersionAndChannel.version === versionAndChannel.version && projectVersionAndChannel.channel === versionAndChannel.channel, null);
        if (constants.knownChannels.indexOf(version) !== -1) {
            if (version !== versionAndChannel.channel) {
                row.mismatch = `Directory doesn't match channel ${versionAndChannel.channel}`;
            }
        }
        else {
            if (version !== versionAndChannel.version) {
                row.mismatch = `Directory doesn't match version ${versionAndChannel.version}`;
            }
        }
        rows.push(row);
    }
    console.table(rows);
    process.exit();
}

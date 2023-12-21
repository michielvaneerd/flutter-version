import * as fs from 'fs';
import * as utils from '../utils.js';
import constants from '../constants.json' with { type: 'json' };
class OutputRow {
    directory;
    tag;
    version;
    channel;
    active;
    project;
    mismatch;
    constructor(directory, tag, version, channel, active, project, mismatch) {
        this.directory = directory;
        this.tag = tag;
        this.version = version;
        this.channel = channel;
        this.active = active;
        this.project = project;
        this.mismatch = mismatch;
    }
}
export const description = 'Lists all Flutter versions';
export async function execList(flutterVersionsDir) {
    const globalActiveVersionInfo = utils.getGlobalActiveVersionInfo();
    const projectVersionInfo = utils.isInRootOfFlutterProject() ? utils.getProjectVersionInfo() : null;
    const files = fs.readdirSync(flutterVersionsDir).filter(function (file) {
        return file.startsWith('flutter-');
    }).map(function (file) {
        return file.substring(file.indexOf('-') + 1);
    });
    files.sort();
    const rows = [];
    for (const version of files) {
        const dir = `flutter-${version}`;
        const versionInfo = utils.getFlutterVersionInfo(`${flutterVersionsDir}/${dir}`);
        const row = new OutputRow(dir, version, versionInfo.version, versionInfo.channel, versionInfo.version === globalActiveVersionInfo.version && versionInfo.channel === globalActiveVersionInfo.channel, projectVersionInfo !== null && projectVersionInfo.version === versionInfo.version && projectVersionInfo.channel === versionInfo.channel);
        if (constants.knownChannels.indexOf(version) !== -1) {
            if (version !== versionInfo.channel) {
                row.mismatch = `Directory doesn't match channel ${versionInfo.channel}`;
            }
        }
        else {
            if (version !== versionInfo.version) {
                row.mismatch = `Directory doesn't match version ${versionInfo.version}`;
            }
        }
        rows.push(row);
    }
    console.table(rows);
    process.exit();
}

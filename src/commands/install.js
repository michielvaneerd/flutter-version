import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from '../utils.js';

/**
 * Install specific Flutter version
 * Examples:
 *  `flutter-version install 3.16.8 stable`
 *  `flutter-version install 3.16.8.pre beta`
 */
export async function execInstall(flutterVersionsDir) {
    const tmpDir = os.tmpdir();
    const tag = process.argv[3]; // stable: 3.16.4 and beta: 3.18.0-0.2.pre (include PRE!)
    const channel = process.argv[4] ?? 'stable'; // can be beta or stable
    if (['stable', 'beta'].indexOf(channel) === -1) {
        utils.exitOnError('Invalid channel argument.');
    }

    // See for SDK archive: https://docs.flutter.dev/release/archive?tab=macos

    const arch = os.arch();
    const url = `https://storage.googleapis.com/flutter_infra_release/releases/${channel}/macos/flutter_macos_${arch === 'arm64' ? 'arm64_' : ''}${tag}-${channel}.zip`;
    const zipFile = await utils.download(url, tmpDir, true);
    await utils.unzip(zipFile, tmpDir, true);
    // The ZIP file is unzipped into /tmp/flutter, so now rename this to the tagged directory name and move to the flutter versions dir
    fs.renameSync(path.join(tmpDir, 'flutter'), path.join(flutterVersionsDir, `flutter-${tag}`));
    fs.unlinkSync(zipFile);
    process.exit();
}

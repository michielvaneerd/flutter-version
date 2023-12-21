import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as utils from '../utils.js';
export const description = 'Install Flutter version';
export async function execInstall(flutterVersionsDir) {
    const tmpDir = os.tmpdir();
    const tag = process.argv[3];
    const channel = process.argv[4] ?? 'stable';
    if (['stable', 'beta'].indexOf(channel) === -1) {
        utils.exitOnError('Invalid channel argument.');
    }
    const arch = os.arch();
    const url = `https://storage.googleapis.com/flutter_infra_release/releases/${channel}/macos/flutter_macos_${arch === 'arm64' ? 'arm64_' : ''}${tag}-${channel}.zip`;
    const zipFile = await utils.download(url, tmpDir, true);
    await utils.unzip(zipFile, tmpDir, true);
    fs.renameSync(path.join(tmpDir, 'flutter'), path.join(flutterVersionsDir, `flutter-${tag}`));
    fs.unlinkSync(zipFile);
    process.exit();
}

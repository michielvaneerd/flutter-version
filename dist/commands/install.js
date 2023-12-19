var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
export function execInstall(flutterVersionsDir) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const tmpDir = os.tmpdir();
        const tag = process.argv[3]; // stable: 3.16.4 and beta: 3.18.0-0.2.pre (include PRE!)
        const channel = (_a = process.argv[4]) !== null && _a !== void 0 ? _a : 'stable'; // can be beta or stable
        if (['stable', 'beta'].indexOf(channel) === -1) {
            utils.exitOnError('Invalid channel argument.');
        }
        // See for SDK archive: https://docs.flutter.dev/release/archive?tab=macos
        const arch = os.arch();
        const url = `https://storage.googleapis.com/flutter_infra_release/releases/${channel}/macos/flutter_macos_${arch === 'arm64' ? 'arm64_' : ''}${tag}-${channel}.zip`;
        const zipFile = yield utils.download(url, tmpDir, true);
        yield utils.unzip(zipFile, tmpDir, true);
        // The ZIP file is unzipped into /tmp/flutter, so now rename this to the tagged directory name and move to the flutter versions dir
        fs.renameSync(path.join(tmpDir, 'flutter'), path.join(flutterVersionsDir, `flutter-${tag}`));
        fs.unlinkSync(zipFile);
        process.exit();
    });
}

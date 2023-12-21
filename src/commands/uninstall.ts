import * as path from 'path';
import * as fs from 'fs';
import * as utils from '../utils.js';

/**
 * Description of the `uninstall` command.
 */
export const description = 'Uninstall Flutter version';

export async function execUninstall(argv: Array<string>, flutterVersionsDir: string) {
    const tag = argv[0];
    const file = path.join(flutterVersionsDir, `flutter-${tag}`);
    if (!fs.existsSync(file)) {
        utils.exitOnError(`File ${file} does not exist.`);
    }
    fs.rmSync(file, { recursive: true, force: true });
}


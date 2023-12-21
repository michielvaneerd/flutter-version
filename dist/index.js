import * as os from 'os';
import * as fs from 'fs';
import * as utils from './utils.js';
import { execList, description as listDescription } from './commands/list.js';
import { execPath, description as pathDescription } from './commands/path.js';
import { execVersioned, description as versionedDescription } from './commands/versioned.js';
import { execInstall, description as installDescription } from './commands/install.js';
import { execSwitch, description as switchDescription } from './commands/switch.js';
import { execUninstall, description as uninstallDescription } from './commands/uninstall.js';
function initPaths(homeDir) {
    const systemConfig = {
        flutterVersionsDir: `${homeDir}/flutter-versions`,
        flutterSymlink: `${homeDir}/flutter`
    };
    if (fs.existsSync(`${homeDir}/.flutter-version.json`)) {
        try {
            const json = JSON.parse(fs.readFileSync(`${homeDir}/.flutter-version.json`, 'utf8'));
            if (json.flutterVersionsDir) {
                systemConfig.flutterVersionsDir = json.flutterVersionsDir.replace("~", homeDir);
            }
            if (json.flutterSymlink) {
                systemConfig.flutterSymlink = json.flutterSymlink.replace("~", homeDir);
            }
        }
        catch (ex) {
            utils.exitOnError(ex instanceof Error ? ex.toString() : 'Unknown error');
        }
    }
    return systemConfig;
}
async function init() {
    const paths = initPaths(os.homedir());
    const availableCommands = {
        'install': {
            description: installDescription,
            func: () => execInstall(paths.flutterVersionsDir)
        },
        'uninstall': {
            description: uninstallDescription,
            func: (argv) => execUninstall(argv, paths.flutterVersionsDir)
        },
        'list': {
            description: listDescription,
            func: () => execList(paths.flutterVersionsDir)
        },
        'switch': {
            description: switchDescription,
            func: (argv) => execSwitch(argv, paths.flutterVersionsDir, paths.flutterSymlink)
        },
        'versioned': {
            description: versionedDescription,
            func: () => execVersioned(paths.flutterSymlink)
        },
        'path': {
            description: pathDescription,
            func: () => execPath(paths.flutterSymlink)
        }
    };
    if (process.argv.length <= 2 || !(process.argv[2] in availableCommands)) {
        utils.exitOnError('Missing or unknown command for flutter-version');
    }
    try {
        await availableCommands[process.argv[2]].func(process.argv.slice(3));
    }
    catch (err) {
        console.error(err);
    }
}
init();

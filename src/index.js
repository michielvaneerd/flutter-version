const os = require('os');
const utils = require('./utils');

const homeDir = os.homedir();
const paths = utils.initPaths(homeDir);

const { execList } = require('./commands/list');
const { execPath } = require('./commands/path');
const { execVersioned } = require('./commands/versioned');
const { execInstall } = require('./commands/install');
const { execSwitch } = require('./commands/switch');
const { execUninstall } = require('./commands/uninstall');

const availableCommands = {
    'install': {
        description: 'Install a specific Flutter version',
        func: () => execInstall(paths.flutterVersionsDir),
        examples: [
            `install VERSION CHANNEL`,
            `install 3.13.9 stable`,
            `install 3.18.0-0.2.pre beta`,
        ]
    },
    'uninstall': {
        description: 'Uninstall a specific Flutter version',
        func: (argv) => execUninstall(argv, paths.flutterVersionsDir)
    },
    'list': {
        description: 'Lists all available Flutter versions',
        func: () => execList(paths.flutterVersionsDir)
    },
    'switch': {
        description: 'Switches to a specific Flutter version and updates the .flutter-version.json file if you are in the root of a Flutter project.',
        examples: [
            'switch VERSION - Switches to a specific Flutter version',
            `switch - Without VERSION argument - can be used only when inside a Flutter project directory - switches to the Flutter version that is written in the .flutter-version.json file, or, if this file doesn't exist, to the current active Flutter version`,
        ],
        func: (argv) => execSwitch(argv, paths.flutterVersionsDir, paths.flutterSymlink)
    },
    'versioned': {
        description: 'Checks if the current active Flutter is inside a versioned directory',
        func: () => execVersioned(paths.flutterSymlink)
    },
    'path': {
        description: 'Gets the path of the current active Flutter',
        func: () => execPath(paths.flutterSymlink)
    }
};

function exitWithHelpText(message) {
    console.log('');
    console.error(`${message} Commands:`);
    console.log('');
    for (var key in availableCommands) {
        console.log(`${key} - ${availableCommands[key].description}`);
        if (availableCommands[key].examples) {
            console.group();
            availableCommands[key].examples.forEach(function (example) {
                console.log(example);
            });
            console.groupEnd();
        }
        console.log('');
    }
    
    
    process.exit(1);
}



(async function () {

    if (process.argv.length <= 2 || !(process.argv[2] in availableCommands)) {
        exitWithHelpText('Missing or unknown command.');
    }

    const command = process.argv[2];

    try {
        await availableCommands[command].func(process.argv.slice(3));
    } catch (err) {
        console.error(err);
    }

}());
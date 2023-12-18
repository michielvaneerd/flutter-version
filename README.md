# Flutter version switcher

- Switch easily between multiple Flutter versions and channels.
- Writes down the Flutter version and channel into your Flutter project.
- You can have `versioned` and `unversioned` Flutter versions.

A `versioned` Flutter means that it is fixed on this version. This cannot be upgraded.
`Unversioned` means that the Flutter version is `stable`, `beta` or `master` and this can be upgraded.

## Installation

`npm i -g flutter-version`

## Initialize

The command `flutter-version init` will do:

- Checks if `~/flutter-versions` exists or create it.
- Downloads the stable flutter into this directory.
- Creates the `~/flutter` symlink to the downloaded stable Flutter.
- Displays the line that you should add to your `.zprofile`.

## Prerequisites

- All Flutter directories should be in the `~/flutter-versions` directory. Possible sub directories:
    - `/flutter-versions/flutter-3.16.1` - this is a stable versioned directory
    - `/flutter-versions/flutter-master` - the master channel
    - `/flutter-versions/flutter-beta` - the unversioned beta channel
    - `/flutter-versions/flutter-stable` - the unversioned stable channel
- A symlink from `~/flutter` to one of the directories above should exist. For example pointing to `~/flutter-versions/flutter-3.16.1`.
- The path `~/flutter/bin` should be added to your `PATH` (use `.zprofile` on Mac as `.zshrc` isn't read by VSCode).

Note that currently the versioned directories assume it is the stable channel.

## VSCode

Disable _Dart: Add SDK to terminal path_ because otherwise your last Flutter path will be added to the $PATH. If you forgot to do this and you see an old Flutter path when you do: `echo $PATH`, make sure to do an `exit` from the Terminal, then close VScode and start it again. Then double check `echo $PATH` and verify if your old Flutter path has been removed.

Make also sure that you don't have any entries for `flutterSdkPaths` in your VSCOde settings file. This setting enables switching versions from within VSCode, but it writes down the used version in the `settings.json` file, which is not what we want.

Add your flutter path to the `.vscode/settings.json` file in your Flutter project:

```json
{
    "dart.flutterSdkPath": "~/flutter"
}
```

## Commands

### List

Lists all Flutter versions available.

```shell
flutter-version list
```

```shell
┌─────────┬──────────────────┬──────────┬──────────┬────────┬─────────┬──────────┐
│ (index) │    directory     │ version  │ channel  │ active │ project │ mismatch │
├─────────┼──────────────────┼──────────┼──────────┼────────┼─────────┼──────────┤
│    0    │ 'flutter-3.13.9' │ '3.13.9' │ 'stable' │ false  │  false  │   null   │
│    1    │ 'flutter-stable' │ '3.16.2' │ 'stable' │  true  │  true   │   null   │
└─────────┴──────────────────┴──────────┴──────────┴────────┴─────────┴──────────┘
```

### Switch

Switches the Flutter version on your system and, if you are in the root of a Flutter project, writes the version and channel into the `.flutter-version.json` file.

Switches to the master channel (note that `~/flutter-versions/flutter-master` should exist):

```shell
flutter-version switch master
```

Switches to a specific version  (note that `~/flutter-versions/flutter-3.16.2` should exist):

```shell
flutter-version switch 3.16.2
```

If you are in a project and you want to switch to whatever Flutter version if written into the `.flutter-version.json` file, just do a switch without version or channel argument:

```shell
flutter-version switch
```

### Gets the current active Flutter path

This prints the real path to the Flutter directory.

```shell
flutter-version flutter-path
```

## Hijack the `flutter` command

While not required, it's best to hijack the `flutter` command, because it prevents you from doing:

- Running `flutter upgrade` while your active Flutter version points to a versioned directory, for example `~/flutter-versions/flutter-13.6.2`, because then the directory version and the real version wouldn't match anymore.
- Running `flutter channel CHANNEL`, because you should just download a channel, place it in the `~/flutter-versions/flutter-CHANNEL` directory and run `flutter upgrade` while this channel is the active Flutter version.

To make this work, make the [./flutter](flutter) bash script executable with `chmod u+x flutter` and add it to your `PATH` before `~/flutter/bin`. This way this command will be executed instead of the "official" flutter command. On MAC OS, add this to the `.zprofile` file and NOT the `.zshrc` file, as this last one isn't read by VSCode.

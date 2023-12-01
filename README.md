# Flutter version switcher

- Switch easily between multiple Flutter versions and channels.
- Writes down the Flutter version and channel into your Flutter project.

## Installation

`npm i -g flutter-version`

## Prerequisites

- All Flutter directories should be in the `~/flutter-versions` directory. Possible sub directories:
    - `/flutter-versions/flutter-3.16.1` - this is a stable versioned directory
    - `/flutter-versions/flutter-master` - the master channel
    - `/flutter-versions/flutter-beta` - the beta channel
    - `/flutter-versions/flutter-stable` - the stable channel
- A symlink from `~/flutter` to one of the directories above should exist. For example pointing to `~/flutter-versions/flutter-3.16.1`.
- The path `~/flutter/bin` should be added to your `PATH`.

Note that currently the versioned directories assume it is the stable channel.

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

While not required, it's best to hijack the `flutter` command, becaue it prevents you from doing:

- Running `flutter upgrade` while your active Flutter version points to a versioned directory, for example `~/flutter-versions/flutter-13.6.2`, because then the directory version and the real version wouldn't match anymore.
- Running `flutter channel CHANNEL`, because you should just download a channel, place it in the `~/flutter-versions/flutter-CHANNEL` directory and run `flutter upgrade` while this channel is the active Flutter version.

To make this work, make the [./flutter](flutter) bash script executable with `chmod u+x flutter` and add it to your `PATH` before `~/flutter/bin`. This way this command will be executed instead of the "official" flutter command.
# Flutter version switcher

A tool that enables you to manage Flutter versions. Works on Mac in the terminal and VSCode.

## Getting started

Do the following things before using this tool:

### 1. Download most recent stable Flutter

First download the most recent stable Flutter distribution and unzip it into `~/flutter-versions/flutter-stable`. This directory should look like:

- `~/flutter-versions/flutter-stable`
- `~/flutter-versions/flutter-stable/bin`
- `~/flutter-versions/flutter-stable/bin/flutter`
- etc.

### 2. Create a symlink to the Flutter installation

Create a symlink `~/flutter` that is pointing to `~/flutter-versions/flutter-stable`:

```shell
ln -s ~/flutter-versions/flutter-stable ~/flutter
```

### 3. Add the Flutter bin to your PATH

Add `~/flutter/bin` to your `PATH` in your `.zprofile`.

## How it works

After completing the `Getting started` section, adding a new Flutter version means just repeating the first 2 steps of this section: downloading the Flutter version and unzipping into `~/flutter-versions` and then making the symlink `~/flutter` to point to this new version. This is exactly what this script does.

## Installation

`npm i -g flutter-version`

## VSCode

Disable _Dart: Add SDK to terminal path_ (sets `dart.addSdkToTerminalPath` to `false`), because otherwise your last Flutter path will be added to the $PATH. If you forgot to do this and you see an old Flutter path when you do: `echo $PATH`, make sure to do an `exit` from the Terminal, then close VScode and start it again. Then double check `echo $PATH` and verify if your old Flutter path has been removed.

Don't specify entries for `dart.flutterSdkPaths` in your VSCOde settings file. This setting enables switching versions from within VSCode, but it writes down the used version in the `settings.json` file, which is not what we want.

Add your flutter symlink path to the `dart.flutterSdkPath` setting:

```json
{
    "dart.flutterSdkPath": "~/flutter"
}
```

## Commands

### List installed Flutter versions

Lists all Flutter versions.

```shell
flutter-version list
```
The output will be something like:

```shell
┌─────────┬──────────────────┬──────────┬──────────┬──────────┬────────┬─────────┬───────────┐
│ (index) │    directory     │   tag    │ version  │ channel  │ active │ project │ mismatch  │
├─────────┼──────────────────┼──────────┼──────────┼──────────┼────────┼─────────┼───────────┤
│    0    │ 'flutter-3.13.9' │ '3.13.9' │ '3.13.9' │ 'stable' │ false  │  false  │ undefined │
│    1    │ 'flutter-stable' │ 'stable' │ '3.16.4' │ 'stable' │  true  │  false  │ undefined │
└─────────┴──────────────────┴──────────┴──────────┴──────────┴────────┴─────────┴───────────┘
```

- `directory` - the directory name inside the `~/flutter-versions` directory
- `tag` - can be a version (3.13.9) or a named tag (stable, beta, master)
- `version` - the version of this Flutter directory
- `channel` - the channel of this Flutter directory
- `active` - whether this is currently the active version on your system
- `project` - whether this is the Flutter version in your Flutter project - only displays somethings if you are inside a Flutter project
- `mismatch` - displays a warning if you have a versioned Flutter directory, like `flutter-3.13.9`, but the flutter version from the binary is something else

### Install a specific Flutter version

Downloads a specific Flutter version and place it inside the `~/flutter-versions` directory.

```shell
# Install specific stable version
flutter-version install 3.13.9

# Install specific beta version
flutter-version install 3.13.9.pre beta
```

Note that the argument `beta` should be used if you want to install a beta version.

### Uninstall specific Flutter version

```shell
flutter-version uninstall 3.13.9
```

### Switch to a specific Flutter version

Switches the Flutter version on your system and, if you are in the root of a Flutter project, writes the version and channel into the `.flutter-version.json` file.

Switches to the master channel (note that `~/flutter-versions/flutter-master` should exist):

```shell
flutter-version switch master
```

Switches to a specific version  (note that `~/flutter-versions/flutter-3.16.2` should exist):

```shell
flutter-version switch 3.16.2
```

If you are in a Flutter project and you want to switch to whatever Flutter version if written into the `.flutter-version.json` file, just do a switch without version or channel argument:

```shell
flutter-version switch
```

### Gets the current active Flutter path

This prints the real path to the Flutter directory.

```shell
flutter-version path
```

### Sees if we are on a versioned Flutter directory

```shell
flutter-version versioned
```

The output will be 1 if we are on versioned Flutter directory and 0 if we are not but on stable, beta or master.

## Hijack the `flutter` command

While not required, it's best to hijack the `flutter` command, because it prevents you from doing:

- Running `flutter upgrade` while your active Flutter version points to a versioned directory, for example `~/flutter-versions/flutter-13.6.2`, because then the directory version and the real version wouldn't match anymore.
- Running `flutter channel CHANNEL`, because you should just download a channel, place it in the `~/flutter-versions/flutter-CHANNEL` directory and run `flutter upgrade` while this channel is the active Flutter version.

To make this work, place the [./flutter](flutter) bash script somewhere (for example in your `~/bin` directory) and make it executable with `chmod u+x` and add it to your `PATH` before `~/flutter/bin`. This way this command will be executed instead of the "official" flutter command. On Mac OS, add this to the `.zprofile` file and NOT the `.zshrc` file, as this last one isn't read by VSCode. Now you will have something like:

```shell
export PATH="$HOME/bin/flutter:$HOME/flutter/bin:/opt/local/bin:/opt/local/sbin:$PATH"
```

# flutter-version

Node script that helps switching between different Flutter versions inside your Flutter project and globally.

This is not a fully automatic script like [fvm](https://fvm.app/), but just a small help utility that enables to switch between versions and write the current version to the Flutter project directory. It does 2 things:

1. Create a symbolic link to the Flutter version you want.
2. Write the Flutter version inside a file in your project.

## Install

Install this package globally:

`node -g flutter-version`

## Prerequisites

- By default this script uses `~/flutter` as the symlink and `~/flutter-versions` as the directory with flutter versions. If you want to use different values, specify this in the `.flutter-version.json` file. See below for a example.
- Each flutter version should be called flutter-VERSION, for example `flutter-3.16.0`. If you want to have a default flutter directory, call this one `flutter`.
- Add `~/flutter/bin` (or whatever you set as the `flutterSymlink` value) to your PATH.

### Configuration file .flutter-version.json example

The optional `~/.flutter-version.json` file can be used to change some defaults, like the `flutterVersionsDir` and `flutterSymlink`.

These are the default values, but you can change them if needed.

```json
{
    "flutterVersionsDir": "~/flutter-versions",
    "flutterSymlink": "~/flutter"
}
```

### What is doesn't do

Download Flutter versions. Just download the needed versions from https://docs.flutter.dev/release/archive and place them inside the `flutterVersionsDir`.

## Usage

### `flutter-version`

Write down the current active Flutter version to `.flutter-version` inside your project.

### `flutter-version VERSION`

Create a symbolic link to `~/flutter-versions/flutter-VERSION` and then write this version to `.flutter-version` inside your project.

For example to switch to version 3.16.0

`flutter-version 3.16.0`

If you want to use the default version (the one that is called `flutter` - so without a version appended):

`flutter-version default`

### `flutter-version is-default`

Check if the current active Flutter version is the default Flutter version. Use this first before you do `flutter upgrade`.

### `flutter-version list`

Lists all Flutter versions and whether it is the project and/or system version.

## Important

Make sure to ONLY run `flutter upgrade` when your current active flutter version is the default one! You can check this with `flutter-version is-default`.
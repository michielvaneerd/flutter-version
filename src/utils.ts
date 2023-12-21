import * as fs from 'fs';
import { execSync, spawn } from 'child_process';
import * as https from 'https';
import * as path from 'path';

const matchVersionOutputReg = /Flutter\s([\d\.\-\w]+)\s/;
const matchChannelOutputReg = /\schannel\s(stable|beta|master)\s/;
const matchVersionedAppendix = /flutter\-(?=.+[\d])(?=.+[\.])([\d\.\-\w]+)$/;

/**
 * Flutter version information.
 */
type VersionInfo = {
    version: string,
    channel: string,
    dir?: string
}

/**
 * Prints a message to the console and exits the process.
 * @param message The message to print.
 * @param errorCode The exitcode.
 */
function exitOnError(message: string, errorCode = 1): void {
    console.error(`ERROR: ${message}`);
    process.exit(errorCode);
}

/**
 * Downloads a file and stores it.
 * @param url URL of resource to download.
 * @param destinationDir Destination path to store the resource.
 * @param withOutput If true, print progress to the console.
 * @returns The path of the downloaded file.
 */
async function download(url: string, destinationDir: string, withOutput = false): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(url);
        const destination = path.join(destinationDir, fileName);
        try {
            https.get(url, response => {
                if (response.statusCode !== 200) {
                    throw new Error(response.statusMessage);
                }
                const contentLength = parseInt(response.headers['content-length']!, 10);
                let currentDownloadedBytes = 0;
                let currentProgress = 0; // in percentage
                const fileStream = fs.createWriteStream(destination);
                response.pipe(fileStream);
                response.on('data', data => {
                    currentDownloadedBytes += data.length;
                    const newProgress = Math.round(currentDownloadedBytes / contentLength * 100);
                    if (newProgress > currentProgress) {
                        if (withOutput) {
                            process.stdout.write(`Downloaded ${newProgress}% of ${contentLength} bytes\r`);
                        }
                    }
                    currentProgress = newProgress;
                });
                fileStream.on('finish', () => {
                    fileStream.close();
                    console.log("");
                    resolve(destination);
                });
            }).on('error', err => {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Unzips a file.
 * @param path Path of file to unzip.
 * @param destination Destination path of unzipped file.
 * @param withOutput If true, prints progress to the console.
 */
async function unzip(path: string, destination: string, withOutput = false): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const cmd = spawn('unzip', ['-o', path, '-d', destination]);
            if (withOutput) {
                cmd.stdout.on('data', data => {
                    process.stdout.write(`${data}`);
                });
            }
            cmd.stderr.on('data', data => {
                reject(`${data}`);
            });
            cmd.on('exit', code => {
                if (code !== 0) {
                    reject(code);
                } else {
                    resolve();
                }
            });
            cmd.on('error', err => {
                reject(err);
            });
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Checks whether we are in the root of a Flutter project directory.
 */
function isInRootOfFlutterProject(): boolean {
    return fs.existsSync('pubspec.yaml');
}

/**
 * Returns the path the Flutter symlink (~/flutter by default) is pointing to.
 * @param flutterSymlink The Flutter symlink path.
 */
function getPathOfSymlink(flutterSymlink: string): string {
    return fs.readlinkSync(flutterSymlink);
}

/**
 * Checks whether the path is versioned, like `flutter-3.16.2` (in opposite to unversioned like `flutter-stable`).
 * @param path Path to check.
 */
function isVersionedPath(path: string): boolean {
    const match = matchVersionedAppendix.exec(path);
    return match !== null && match.length >= 2 && match[1].trim() !== '';
}

/**
 * Returns the projects Flutter version info that is written into yhe .flutter-version.json file.
 */
function getProjectVersionInfo(): VersionInfo | null {
    return fs.existsSync('.flutter-version.json') ? JSON.parse(fs.readFileSync('.flutter-version.json', 'utf8').trim()) : null;
}

/**
 * Returns the current active Flutter version, e.g. the output of the `flutter --version` command.
 */
function getGlobalActiveVersionInfo(): VersionInfo {
    return getFlutterVersionInfo();
}

/**
 * Returns the Flutter version info of this Flutter directory.
 * @param path Path to check. If empty, the active Flutter directory is used.
 */
function getFlutterVersionInfo(path = ''): VersionInfo {
    const realPath = path ? `${path}/bin/flutter --version` : 'flutter --version';
    const output = execSync(realPath).toString();
    const versionMatch = matchVersionOutputReg.exec(output);
    const channelMatch = matchChannelOutputReg.exec(output);
    if (versionMatch === null || versionMatch.length < 2) {
        exitOnError('Cannot get Flutter version from flutter --version command');
    }
    if (channelMatch === null || channelMatch.length < 2) {
        exitOnError('Cannot get Flutter channel from flutter --version command');
    }
    return {
        version: versionMatch![1].trim(),
        channel: channelMatch![1].trim()
    };
}

export {
    exitOnError,
    getFlutterVersionInfo,
    getGlobalActiveVersionInfo,
    getProjectVersionInfo,
    isInRootOfFlutterProject,
    getPathOfSymlink,
    isVersionedPath,
    download,
    unzip
}
import * as fs from 'fs';
import { execSync, spawn } from 'child_process';
import * as https from 'https';
import * as path from 'path';
const matchVersionOutputReg = /Flutter\s([\d+][\d\.\-\w]+)\s/;
const matchChannelOutputReg = /\schannel\s(stable|beta|master)\s/;
const matchVersionedAppendix = /flutter\-(?=.+[\d])(?=.+[\.])([\d\.\-\w]+)$/;
function exitOnError(message, errorCode = 1) {
    console.error(`ERROR: ${message}`);
    process.exit(errorCode);
}
async function download(url, destinationDir, withOutput = false) {
    return new Promise((resolve, reject) => {
        const fileName = path.basename(url);
        const destination = path.join(destinationDir, fileName);
        try {
            https.get(url, response => {
                if (response.statusCode !== 200) {
                    throw new Error(response.statusMessage);
                }
                const contentLength = parseInt(response.headers['content-length'], 10);
                let currentDownloadedBytes = 0;
                let currentProgress = 0;
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
        }
        catch (err) {
            reject(err);
        }
    });
}
async function unzip(path, destination, withOutput = false) {
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
                }
                else {
                    resolve();
                }
            });
            cmd.on('error', err => {
                reject(err);
            });
        }
        catch (err) {
            reject(err);
        }
    });
}
function isInRootOfFlutterProject() {
    return fs.existsSync('pubspec.yaml');
}
function getPathOfSymlink(flutterSymlink) {
    return fs.readlinkSync(flutterSymlink);
}
function isVersionedPath(path) {
    const match = matchVersionedAppendix.exec(path);
    return match !== null && match.length >= 2 && match[1].trim() !== '';
}
function getProjectVersionInfo() {
    return fs.existsSync('.flutter-version.json') ? JSON.parse(fs.readFileSync('.flutter-version.json', 'utf8').trim()) : null;
}
function getGlobalActiveVersionInfo() {
    return getFlutterVersionInfo();
}
function getFlutterVersionInfo(path = '') {
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
        version: versionMatch[1].trim(),
        channel: channelMatch[1].trim()
    };
}
export { exitOnError, getFlutterVersionInfo, getGlobalActiveVersionInfo, getProjectVersionInfo, isInRootOfFlutterProject, getPathOfSymlink, isVersionedPath, download, unzip };

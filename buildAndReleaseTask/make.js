var ncp = require('child_process');
var process = require('process');

function build() {
    let downloadUrl = 'https://vstsagenttools.blob.core.windows.net/tools/7zr/1805_x86/7zr.zip';
    ncp.execSync(`curl -o ./7zr.zip ${downloadUrl}`)
    if (process.platform == 'win32') {
        ncp.execSync('powershell -Command "Remove-Item ./7zr.exe"');
        let command = `$ErrorActionPreference = 'Stop' ; try { Add-Type -AssemblyName System.IO.Compression.FileSystem } catch { } ; [System.IO.Compression.ZipFile]::ExtractToDirectory('./7zr.zip', './')`;
        ncp.execSync(`powershell -Command "${command}"`);
        ncp.execSync('powershell -Command "Remove-Item ./7zr.zip"');
    } else {
        ncp.execSync(`unzip ./7zr.zip -d ./`);
        ncp.execSync('rm ./7zr.zip');
    }
}

module.exports.build = build;
build();
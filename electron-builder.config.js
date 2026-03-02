const { getFullVersion } = require('./get-package-information.js');

const config = {
    appId: 'com.digimezzo.knowte',
    productName: 'Knowte',
    snap: {
        base: 'core22', // Must match build server (currently Ubuntu 22.04)
        grade: 'stable',
        confinement: 'strict',
        plugs: [
            // REQUIRED for Electron desktop apps
            'desktop',
            'desktop-legacy',
            'wayland',
            'x11',
            'unity7',
            'opengl',
            'audio-playback',
            'browser-support',
            'network',
            'network-bind',
            'gsettings',
            'screen-inhibit-control',

            // File access
            'home',
            'removable-media',
        ],
    },
    nsis: {
        shortcutName: 'Knowte',
        perMachine: true,
    },
    directories: {
        output: 'release',
    },
    files: ['**/*'],
    extraResources: ['LICENSE'],
    win: {
        target: ['nsis'],
        artifactName: `\${productName}-${getFullVersion()}.\${ext}`,
    },
    mac: {
        target: ['dmg'],
        artifactName: `\${productName}-${getFullVersion()}.\${ext}`,
    },
    linux: {
        target: ['AppImage', 'deb', 'rpm', 'pacman', 'snap'],
        category: 'Utility',
        artifactName: `\${productName}-${getFullVersion()}.\${ext}`,
        synopsis: 'Cross platform note taking application.',
        description: 'Knowte is a note taking application that allows you to quickly and easily organize and find your notes.',
        executableName: 'knowte',
    },
};

module.exports = config;

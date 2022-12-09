const { getFullVersion } = require('./get-package-information.js');

const config = {
    appId: 'com.digimezzo.knowte',
    productName: 'Knowte',
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
        target: ['pacman'],
        category: 'Audio',
        artifactName: `\${productName}-${getFullVersion()}.\${ext}`,
        desktop: {
            Name: 'Knowte',
            Terminal: 'false',
        },
    },
};

module.exports = config;

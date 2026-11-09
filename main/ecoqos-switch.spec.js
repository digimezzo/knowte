const fs = require('fs');
const path = require('path');
const vm = require('vm');
const typescript = require('typescript');

describe('Chromium EcoQoS startup switch', () => {
    function runStartup(platform) {
        const commandLine = {
            appendSwitch: jest.fn(),
        };
        const source = fs.readFileSync(path.join(__dirname, '../main.ts'), 'utf8').split("log.create('main');")[0];
        const compiled = typescript.transpileModule(source, {
            compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2017 },
        });
        vm.runInNewContext(compiled.outputText, {
            require: (name) => name === 'electron' ? { app: { commandLine } } : require(name),
            exports: {},
            process: { platform },
        });
        return commandLine;
    }

    test.each(['win32', 'linux', 'darwin'])('sets the Chromium feature switch on %s', (platform) => {
        const commandLine = runStartup(platform);
        expect(commandLine.appendSwitch).toHaveBeenCalledWith('disable-features', 'UseEcoQoSForBackgroundProcess');
    });
});

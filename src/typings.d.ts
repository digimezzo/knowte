/* SystemJS module definition */
declare const nodeModule: NodeModule;
interface NodeModule {
    id: string;
}

interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Electron injects these Node globals
    process: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Electron injects these Node globals
    require: any;
}

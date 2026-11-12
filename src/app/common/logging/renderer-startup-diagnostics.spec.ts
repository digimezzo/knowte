import { Logger } from './logger';
import { PerformanceDiagnostics } from './performance-diagnostics';
import { logRendererStartup } from './renderer-startup-diagnostics';

jest.mock('electron-log', () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn() }));

describe('renderer startup diagnostics', () => {
    let info: jest.SpyInstance;
    let originalGetEntries: PropertyDescriptor | undefined;

    beforeEach(() => {
        info = jest.spyOn(Logger.prototype, 'info');
        originalGetEntries = Object.getOwnPropertyDescriptor(performance, 'getEntriesByType');
        Object.defineProperty(performance, 'getEntriesByType', { configurable: true, value: jest.fn(), writable: true });
    });

    afterEach(() => {
        PerformanceDiagnostics.configure(false);
        jest.restoreAllMocks();
        if (originalGetEntries) {
            Object.defineProperty(performance, 'getEntriesByType', originalGetEntries);
        } else {
            Reflect.deleteProperty(performance, 'getEntriesByType');
        }
    });

    it('does not log or read timing entries when disabled', () => {
        PerformanceDiagnostics.configure(false);
        const getEntries = jest.spyOn(performance, 'getEntriesByType');
        logRendererStartup(40, 100);
        expect(info).not.toHaveBeenCalled();
        expect(getEntries).not.toHaveBeenCalled();
    });

    it('reports startup timings and resource categories without paths', () => {
        PerformanceDiagnostics.configure(true);
        jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
        const entry: PerformanceEntry = { name: '', entryType: '', startTime: 0, duration: 0, toJSON: () => ({}) };
        const navigation = { ...entry, responseStart: 10, responseEnd: 20, domInteractive: 90, domContentLoadedEventEnd: 100, loadEventStart: 110 };
        const script = { ...entry, initiatorType: 'script', name: 'file:///private/main.secret.js', startTime: 20, duration: 50 };
        jest.spyOn(performance, 'getEntriesByType').mockImplementation((type) => {
            if (type === 'navigation') {
                return [navigation];
            }
            return [script];
        });
        logRendererStartup(80, 120);
        const messages = info.mock.calls.map(([message]) => message);
        expect(messages).toEqual(expect.arrayContaining([
            expect.stringContaining('mainEntry=80.0 ms; angularBootstrap=120.0 ms'),
            expect.stringContaining('responseStart=10.0 ms; responseEnd=20.0 ms; domInteractive=90.0 ms'),
            expect.stringContaining('resource type=script; bundle=main; start=20.0 ms; duration=50.0 ms'),
        ]));
        expect(messages.join(' ')).not.toContain('private');
        expect(messages.join(' ')).not.toContain('secret');
    });

    it('reports unavailable navigation timing', () => {
        PerformanceDiagnostics.configure(true);
        jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
        jest.spyOn(performance, 'getEntriesByType').mockReturnValue([]);
        logRendererStartup(0, 0);
        expect(info).toHaveBeenCalledWith(
            expect.stringContaining('navigation timing unavailable'), 'Performance', 'rendererStartup',
        );
    });

    it('reports when the timing API is unavailable', () => {
        PerformanceDiagnostics.configure(true);
        jest.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
        Reflect.deleteProperty(performance, 'getEntriesByType');
        logRendererStartup(0, 0);
        expect(info).toHaveBeenCalledWith(
            expect.stringContaining('navigation and resource timing APIs unavailable'), 'Performance', 'rendererStartup',
        );
    });

    it('waits for the load event before recording navigation milestones', () => {
        PerformanceDiagnostics.configure(true);
        jest.spyOn(document, 'readyState', 'get').mockReturnValue('loading');
        const getEntries = jest.spyOn(performance, 'getEntriesByType').mockReturnValue([]);
        logRendererStartup(10, 20);
        expect(getEntries).not.toHaveBeenCalled();
        window.dispatchEvent(new Event('load'));
        expect(getEntries).toHaveBeenCalledTimes(2);
        window.dispatchEvent(new Event('load'));
        expect(getEntries).toHaveBeenCalledTimes(2);
    });
});

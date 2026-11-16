import { Logger } from './logger';
import { PerformanceDiagnostics } from './performance-diagnostics';

jest.mock('electron-log', () => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
}));

describe('PerformanceDiagnostics', () => {
    let now: number;
    let info: jest.SpyInstance;
    let warn: jest.SpyInstance;

    beforeEach(() => {
        PerformanceDiagnostics.configure(true);
        jest.useFakeTimers();
        now = 0;
        jest.spyOn(performance, 'now').mockImplementation(() => now);
        info = jest.spyOn(Logger.prototype, 'info');
        warn = jest.spyOn(Logger.prototype, 'warn');
    });

    afterEach(() => {
        PerformanceDiagnostics.configure(false);
        jest.clearAllTimers();
        jest.restoreAllMocks();
        jest.clearAllMocks();
        jest.useRealTimers();
    });

    it('does not time, log or start a timer when disabled, but still executes operations', async () => {
        PerformanceDiagnostics.configure(false);
        const clock = jest.spyOn(performance, 'now').mockClear();
        const finish = PerformanceDiagnostics.start('Database.save', true);
        finish();
        expect(PerformanceDiagnostics.measure('query', () => 42, true)).toBe(42);
        expect(await PerformanceDiagnostics.measureAsync('read', async () => 'contents', true)).toBe('contents');
        const error = new Error('Failure');
        expect(() => PerformanceDiagnostics.measure('query', () => { throw error; })).toThrow(error);
        await expect(PerformanceDiagnostics.measureAsync('read', async () => { throw error; })).rejects.toBe(error);
        PerformanceDiagnostics.monitorEventLoop('Main window')();
        expect(clock).not.toHaveBeenCalled();
        expect(info).not.toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
        expect(jest.getTimerCount()).toBe(0);
    });

    it('does not log fast operations unless requested', () => {
        expect(PerformanceDiagnostics.measure('query', () => {
            now = 99.9;
            return 42;
        })).toBe(42);
        expect(info).not.toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
    });

    it('logs operations at the 100 ms threshold with elapsed time and process ID', () => {
        PerformanceDiagnostics.measure('query', () => { now = 100; });
        expect(warn).toHaveBeenCalledWith(
            expect.stringMatching(new RegExp(`query #\\d+ \\(pid=${process.pid}\\): finished in 100.0 ms`)),
            'Performance', 'operation',
        );
    });

    it('pairs start and finish entries using the same operation ID', () => {
        const finish = PerformanceDiagnostics.start('Database.save', true);
        now = 20;
        finish('callback received');
        const startMessage: string = info.mock.calls[0][0];
        expect(info.mock.calls[1][0]).toBe(startMessage.replace('started', 'finished in 20.0 ms; callback received'));
        expect(warn).not.toHaveBeenCalled();
    });

    it('measures synchronous failures without swallowing them', () => {
        const error = new Error('Failure');
        expect(() => PerformanceDiagnostics.measure('query', () => {
            now = 200;
            throw error;
        })).toThrow(error);
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('200.0 ms'), 'Performance', 'operation');
    });

    it('waits for asynchronous work and preserves results and rejections', async () => {
        let complete: (value: string) => void;
        const result = PerformanceDiagnostics.measureAsync('read', () => new Promise<string>((resolve) => { complete = resolve; }));
        now = 250;
        expect(warn).not.toHaveBeenCalled();
        complete('contents');
        expect(await result).toBe('contents');
        expect(warn).toHaveBeenCalledWith(expect.stringContaining('250.0 ms'), 'Performance', 'operation');

        const error = new Error('Cannot read');
        await expect(PerformanceDiagnostics.measureAsync('read', async () => { throw error; })).rejects.toBe(error);
    });

    it('reports UI stalls at 500 ms of excess delay and stops monitoring on disposal', () => {
        const stop = PerformanceDiagnostics.monitorEventLoop('Main window');
        now = 999;
        jest.advanceTimersByTime(500);
        expect(warn).not.toHaveBeenCalled();
        now = 1999;
        jest.advanceTimersByTime(500);
        expect(warn).toHaveBeenCalledWith(
            expect.stringContaining('Main window UI event loop delayed by 500.0 ms'),
            'Performance', 'eventLoop',
        );
        stop();
        now = 9999;
        jest.advanceTimersByTime(1000);
        expect(warn).toHaveBeenCalledTimes(1);
        expect(jest.getTimerCount()).toBe(0);
    });
});

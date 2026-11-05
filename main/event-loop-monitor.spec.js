const { monitorMainProcessEventLoop } = require('./event-loop-monitor');

describe('Main process event loop monitor', () => {
    let log;
    let time;

    beforeEach(() => {
        jest.useFakeTimers();
        log = { warn: jest.fn() };
        time = 0;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    test('does not log when the event loop keeps up', () => {
        const stop = monitorMainProcessEventLoop(log, () => time);
        time += 500;
        jest.advanceTimersByTime(500);
        time += 700;
        jest.advanceTimersByTime(500);
        expect(log.warn).not.toHaveBeenCalled();
        stop();
    });

    test('logs the excess delay when the event loop is blocked', () => {
        const stop = monitorMainProcessEventLoop(log, () => time);
        time += 3500;
        jest.advanceTimersByTime(500);
        expect(log.warn).toHaveBeenCalledTimes(1);
        expect(log.warn).toHaveBeenCalledWith(expect.stringContaining('Main process event loop delayed by 3000.0 ms'));
        stop();
    });

    test('stops logging after being stopped', () => {
        const stop = monitorMainProcessEventLoop(log, () => time);
        stop();
        time += 5000;
        jest.advanceTimersByTime(5000);
        expect(log.warn).not.toHaveBeenCalled();
    });
});

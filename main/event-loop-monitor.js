const intervalMilliseconds = 500;
const warningThresholdMilliseconds = 500;

// Logs when the main process event loop is blocked. All windows share this process, so a stall here freezes every window.
function monitorMainProcessEventLoop(log, now = () => performance.now()) {
    let previous = now();
    const timer = setInterval(() => {
        const current = now();
        const delay = current - previous - intervalMilliseconds;
        previous = current;
        if (delay >= warningThresholdMilliseconds) {
            log.warn(
                `[Performance] [eventLoop] Main process event loop delayed by ${delay.toFixed(1)} ms (pid=${process.pid}). ` +
                'This can also occur during system sleep.',
            );
        }
    }, intervalMilliseconds);
    return () => clearInterval(timer);
}

module.exports = { monitorMainProcessEventLoop };

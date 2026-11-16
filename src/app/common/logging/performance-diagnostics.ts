import { Logger } from './logger';

export class PerformanceDiagnostics {
    private static readonly slowOperationMilliseconds: number = 100;
    private static readonly logger: Logger = new Logger();
    private static nextOperationId: number = 0;
    private static enabled: boolean = false;
    private static readonly noop = () => {};

    public static configure(enabled: boolean): void {
        this.enabled = enabled;
    }

    public static start(operation: string, logAll: boolean = false): (details?: string) => void {
        if (!this.enabled) {
            return this.noop;
        }
        const id = ++this.nextOperationId;
        const started = performance.now();
        const label = `${operation} #${id} (pid=${process.pid})`;
        if (logAll) {
            this.logger.info(`${label}: started`, 'Performance', 'operation');
        }
        return (details = '') => {
            const elapsed = performance.now() - started;
            const message = `${label}: finished in ${elapsed.toFixed(1)} ms${details ? `; ${details}` : ''}`;
            if (elapsed >= this.slowOperationMilliseconds) {
                this.logger.warn(message, 'Performance', 'operation');
            } else if (logAll) {
                this.logger.info(message, 'Performance', 'operation');
            }
        };
    }

    public static measure<T>(operation: string, action: () => T, logAll: boolean = false): T {
        if (!this.enabled) {
            return action();
        }
        const finish = this.start(operation, logAll);
        try {
            return action();
        } finally {
            finish();
        }
    }

    public static async measureAsync<T>(operation: string, action: () => Promise<T>, logAll: boolean = false): Promise<T> {
        if (!this.enabled) {
            return action();
        }
        const finish = this.start(operation, logAll);
        try {
            return await action();
        } finally {
            finish();
        }
    }

    public static monitorEventLoop(windowRole: string): () => void {
        if (!this.enabled) {
            return this.noop;
        }
        const intervalMilliseconds = 500;
        let previous = performance.now();
        const timer = setInterval(() => {
            const now = performance.now();
            const delay = now - previous - intervalMilliseconds;
            previous = now;
            if (delay >= 500) {
                this.logger.warn(
                    `${windowRole} UI event loop delayed by ${delay.toFixed(1)} ms (pid=${process.pid}). ` +
                    'This can also occur during system sleep or background timer throttling.',
                    'Performance',
                    'eventLoop',
                );
            }
        }, intervalMilliseconds);
        return () => clearInterval(timer);
    }
}

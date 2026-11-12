import { Logger } from './logger';
import { PerformanceDiagnostics } from './performance-diagnostics';

export function logRendererStartup(entryTime: number, bootstrapTime: number): void {
    if (!PerformanceDiagnostics.isEnabled()) {
        return;
    }

    const logger = new Logger();
    const log = (message: string) => logger.info(`${message} (pid=${process.pid})`, 'Performance', 'rendererStartup');
    log(`mainEntry=${entryTime.toFixed(1)} ms; angularBootstrap=${bootstrapTime.toFixed(1)} ms; documentHidden=${document.hidden}`);

    const reportNavigation = () => {
        if (typeof performance.getEntriesByType !== 'function') {
            log('navigation and resource timing APIs unavailable');
            return;
        }
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
        if (navigation) {
            log(`navigation responseStart=${navigation.responseStart.toFixed(1)} ms; responseEnd=${navigation.responseEnd.toFixed(1)} ms; ` +
                `domInteractive=${navigation.domInteractive.toFixed(1)} ms; domContentLoaded=${navigation.domContentLoadedEventEnd.toFixed(1)} ms; ` +
                `loadEventStart=${navigation.loadEventStart.toFixed(1)} ms`);
        } else {
            log('navigation timing unavailable');
        }

        const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
        const scriptsAndStyles = resources.filter((resource) => resource.initiatorType === 'script' || resource.initiatorType === 'link')
            .sort((a, b) => b.duration - a.duration);
        log(`resource count=${scriptsAndStyles.length}; showing up to 5 slowest script or link resources`);
        for (const resource of scriptsAndStyles.slice(0, 5)) {
            const filename = resource.name.split('/').pop()?.split(/[?#]/)[0] || '';
            const bundle = /^(main|runtime|polyfills|scripts|styles|vendor)(?:[.-]|$)/.exec(filename)?.[1] || 'other';
            log(`resource type=${resource.initiatorType}; bundle=${bundle}; start=${resource.startTime.toFixed(1)} ms; ` +
                `duration=${resource.duration.toFixed(1)} ms`);
        }
    };

    if (document.readyState === 'complete') {
        reportNavigation();
    } else {
        window.addEventListener('load', reportNavigation, { once: true });
    }
}

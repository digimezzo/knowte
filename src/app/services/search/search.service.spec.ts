import * as remote from '@electron/remote';
import { EventEmitter } from 'events';
import { SearchEvents } from './search-events';
import { SearchService } from './search.service';

jest.mock('@electron/remote', () => ({ getGlobal: jest.fn() }));

describe('SearchService', () => {
    it('debounces and deduplicates search text', () => {
        jest.useFakeTimers();
        try {
            (remote.getGlobal as jest.Mock).mockReturnValue(new EventEmitter());
            const service = new SearchService();
            const listener = jest.fn();
            service.searchTextChanged$.subscribe(listener);
            service.searchText = 'first';
            service.searchText = 'second';
            jest.advanceTimersByTime(500);
            service.searchText = 'second';
            jest.advanceTimersByTime(500);

            expect(listener).toHaveBeenCalledTimes(1);
            expect(listener).toHaveBeenCalledWith('second');
            window.dispatchEvent(new Event('unload'));
        } finally {
            jest.useRealTimers();
        }
    });

    it('removes its global listener when the window unloads', () => {
        const bus = new EventEmitter();
        (remote.getGlobal as jest.Mock).mockReturnValue(bus);
        new SearchService();
        expect(bus.listenerCount(SearchEvents.getSearchTextEvent)).toBe(1);

        window.dispatchEvent(new Event('unload'));

        expect(bus.listenerCount(SearchEvents.getSearchTextEvent)).toBe(0);
    });
});

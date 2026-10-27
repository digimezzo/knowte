import * as remote from '@electron/remote';
import { EventEmitter } from 'events';
import { SearchEvents } from './search-events';
import { SearchService } from './search.service';

jest.mock('@electron/remote', () => ({ getGlobal: jest.fn() }));

describe('SearchService', () => {
    it('removes its global listener when the window unloads', () => {
        const bus = new EventEmitter();
        (remote.getGlobal as jest.Mock).mockReturnValue(bus);
        new SearchService();
        expect(bus.listenerCount(SearchEvents.getSearchTextEvent)).toBe(1);

        window.dispatchEvent(new Event('unload'));

        expect(bus.listenerCount(SearchEvents.getSearchTextEvent)).toBe(0);
    });
});

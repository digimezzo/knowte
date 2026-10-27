import * as remote from '@electron/remote';
import { EventEmitter } from 'events';
import { Constants } from '../../common/application/constants';
import { Operation } from '../../common/enums/operation';
import { Scheduler } from '../../common/scheduling/scheduler';
import { TasksCount } from '../../common/ui/tasks-count';
import { CollectionClient } from './collection.client';
import { CollectionEvents } from './collection-events';

jest.mock('@electron/remote', () => ({ getGlobal: jest.fn() }));

describe('CollectionClient listener lifetime', () => {
    let bus: EventEmitter;
    let clients: CollectionClient[];

    function createClient(): CollectionClient {
        const client = new CollectionClient(new Scheduler());
        clients.push(client);
        return client;
    }

    beforeEach(() => {
        bus = new EventEmitter();
        clients = [];
        (remote.getGlobal as jest.Mock).mockReturnValue(bus);
    });

    afterEach(() => {
        clients.forEach((client) => client.dispose());
    });

    it('removes only the closed client listeners and keeps deletion working for other windows', () => {
        const closed = createClient();
        const active = createClient();
        const closedHandler = jest.fn();
        closed.prepareNoteDeletion$.subscribe(closedHandler);
        active.prepareNoteDeletion$.subscribe(({ callback }) => callback(Operation.Success));
        const events = bus.eventNames();
        expect(events).toHaveLength(9);

        closed.dispose();
        events.forEach((event) => expect(bus.listenerCount(event)).toBe(1));
        const callback = jest.fn();
        bus.emit(CollectionEvents.prepareNoteDeletionEvent, 'active-note', callback);

        expect(closedHandler).not.toHaveBeenCalled();
        expect(callback).toHaveBeenCalledWith(Operation.Success);
        active.dispose();
        expect(bus.eventNames()).toEqual([]);
    });

    it.each(['unload', 'destroy'])('removes all listeners on %s and tolerates repeated cleanup', (reason) => {
        const client = createClient();
        const remove = jest.spyOn(bus, 'removeListener');
        if (reason === 'unload') {
            window.dispatchEvent(new Event('unload'));
        } else {
            client.ngOnDestroy();
        }
        client.dispose();

        expect(remove).toHaveBeenCalledTimes(9);
        expect(bus.eventNames()).toEqual([]);
    });

    it('does not dispose listeners when a close is cancelled', () => {
        createClient();
        const event = new Event('beforeunload', { cancelable: true });
        event.preventDefault();
        window.dispatchEvent(event);

        expect(bus.eventNames()).toHaveLength(9);
    });

    it('does not accumulate listeners when notes are repeatedly reopened', () => {
        for (let attempt = 0; attempt < 20; attempt++) {
            const client = createClient();
            bus.eventNames().forEach((event) => expect(bus.listenerCount(event)).toBe(1));
            client.dispose();
            expect(bus.eventNames()).toEqual([]);
        }
    });

    it('fails a note text save instead of waiting forever when the main window never answers', async () => {
        let now = 0;
        const now$ = jest.spyOn(Date, 'now').mockImplementation(() => now);
        try {
            const scheduler = new Scheduler();
            jest.spyOn(scheduler, 'sleepAsync').mockImplementation(async (milliseconds: number) => {
                now += milliseconds;
            });
            const client = new CollectionClient(scheduler);
            clients.push(client);

            const result = await client.saveNoteTextAsync('note', 'text', false, '', new TasksCount(0, 0));

            expect(result).toBe(Operation.Error);
            expect(now).toBeGreaterThanOrEqual(Constants.noteMetadataSaveTimeoutMilliseconds);
        } finally {
            now$.mockRestore();
        }
    });
});

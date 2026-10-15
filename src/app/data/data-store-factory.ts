import { Injectable } from '@angular/core';
import { DataStore } from './data-store';
import { LokiDataStore } from './loki-data-store';

@Injectable()
export class DataStoreFactory {
    public async openAsync(databaseFile: string): Promise<DataStore> {
        const store = new LokiDataStore();
        await store.initializeAsync(databaseFile);
        return store;
    }
}

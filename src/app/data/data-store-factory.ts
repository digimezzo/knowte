import { Injectable } from '@angular/core';
import { DataStore } from './data-store';

@Injectable()
export class DataStoreFactory {
    public async openAsync(databaseFile: string): Promise<DataStore> {
        const store = new DataStore();
        await store.initializeAsync(databaseFile);
        return store;
    }
}

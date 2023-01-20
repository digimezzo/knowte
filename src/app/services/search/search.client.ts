import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { Utils } from '../../core/utils';
import { SearchEvents } from './search-events';

/**
 * SearchService should never be initialized from the note window. There should
 * only be 1 instance of SearchService and it should be in the main window.
 * This class ensures that the note window can request data from the SearchService
 * instance that exists in the main window.
 */
@Injectable()
export class SearchClient {
    private globalEmitter: any = remote.getGlobal('globalEmitter');

    public constructor() {}

    public async getSearchTextAsync(): Promise<string> {
        /**
         * It is not possible to change a string from inside a function
         * because it is not a reference type. So we use an array instead.
         */
        let searchTexts: string[] = [];

        this.globalEmitter.emit(SearchEvents.getSearchTextEvent, (receivedSearchText: string) => searchTexts.push(receivedSearchText));

        while (searchTexts.length === 0) {
            await Utils.sleep(50);
        }

        return searchTexts[0];
    }
}

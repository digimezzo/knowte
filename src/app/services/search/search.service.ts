import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { debounceTime, distinctUntilChanged, Observable, Subject } from 'rxjs';
import { SearchEvents } from './search-events';

type SearchTextEventCallback = (searchText: string | undefined) => void;

type GlobalEmitter = {
    on: (event: string, listener: (callback: SearchTextEventCallback) => void) => void;
    removeListener: (event: string, listener: (callback: SearchTextEventCallback) => void) => void;
};

@Injectable()
export class SearchService {
    private debouncingSearchTextChanged: Subject<string> = new Subject<string>();
    private searchTextChanged: Subject<string> = new Subject<string>();
    private timeoutMilliseconds: number = 500;
    private _searchText: string | undefined;
    private globalEmitter: GlobalEmitter = remote.getGlobal('globalEmitter');
    private getSearchTextEventListener: (callback: SearchTextEventCallback) => void = this.getSearchTextEventHandler.bind(this);

    constructor() {
        this.globalEmitter.on(SearchEvents.getSearchTextEvent, this.getSearchTextEventListener);
        // globalEmitter lives in the main process, so listeners would outlive this window otherwise.
        window.addEventListener('unload', () =>
            this.globalEmitter.removeListener(SearchEvents.getSearchTextEvent, this.getSearchTextEventListener),
        );

        this.debouncingSearchTextChanged.pipe(debounceTime(this.timeoutMilliseconds), distinctUntilChanged()).subscribe((searchText) => {
            this.searchTextChanged.next(searchText);
        });
    }

    public searchTextChanged$: Observable<string> = this.searchTextChanged.asObservable();

    public get searchText(): string {
        return this._searchText ?? '';
    }

    public set searchText(v: string) {
        this._searchText = v;
        this.debouncingSearchTextChanged.next(v);
    }

    private getSearchTextEventHandler(callback: (searchText: string | undefined) => void): void {
        callback(this.searchText);
    }
}

import { Injectable } from '@angular/core';
import * as remote from '@electron/remote';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';
import { SearchEvents } from './search-events';

@Injectable()
export class SearchService {
    private debouncingSearchTextChanged: Subject<string> = new Subject<string>();
    private searchTextChanged: Subject<string> = new Subject<string>();
    private timeoutMilliseconds: number = 500;
    private _searchText: string;
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private getSearchTextEventListener: any = this.getSearchTextEventHandler.bind(this);

    constructor() {
        this.globalEmitter.on(SearchEvents.getSearchTextEvent, this.getSearchTextEventListener);

        this.debouncingSearchTextChanged.pipe(debounceTime(this.timeoutMilliseconds), distinctUntilChanged()).subscribe((searchText) => {
            this.searchTextChanged.next(searchText);
        });
    }

    public searchTextChanged$: Observable<string> = this.searchTextChanged.asObservable();

    public get searchText(): string {
        return this._searchText;
    }

    public set searchText(v: string) {
        this._searchText = v;
        this.debouncingSearchTextChanged.next(v);
    }

    private getSearchTextEventHandler(callback: any): void {
        callback(this.searchText);
    }
}

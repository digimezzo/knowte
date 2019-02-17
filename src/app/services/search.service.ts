import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from "rxjs/internal/operators";
import log from 'electron-log';

@Injectable({
    providedIn: 'root',
})
export class SearchService {
    constructor() {
        this.debouncingSearchTextChanged
            .pipe(debounceTime(this.timeoutMilliseconds), distinctUntilChanged())
            .subscribe((searchText) => {
                this.searchTextChanged.next(searchText);
            });
    }

    private debouncingSearchTextChanged: Subject<string> = new Subject<string>();
    private searchTextChanged = new Subject<string>();
    searchTextChanged$ = this.searchTextChanged.asObservable();

    private timeoutMilliseconds: number = 500;
    private _searchText: string;

    public get searchText(): string {
        return this._searchText;
    }
    
    public set searchText(v: string) {
        this._searchText = v;
        this.debouncingSearchTextChanged.next(v);
    }
}
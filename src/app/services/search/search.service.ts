import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/internal/operators';
import { remote } from 'electron';
import { Constants } from '../../core/constants';

@Injectable({
    providedIn: 'root',
})
export class SearchService {
    private debouncingSearchTextChanged: Subject<string> = new Subject<string>();
    private searchTextChanged: Subject<string> = new Subject<string>();
    private timeoutMilliseconds: number = 500;
    private _searchText: string;
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private getSearchTextListener: any = this.getSearchTextHandler.bind(this);

    constructor() {
        this.globalEmitter.on(Constants.getSearchTextEvent, this.getSearchTextListener);

        this.debouncingSearchTextChanged
            .pipe(debounceTime(this.timeoutMilliseconds), distinctUntilChanged())
            .subscribe((searchText) => {
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

    private async getSearchTextHandler(callback: any): Promise<void> {
        callback(this.searchText);
      }
}

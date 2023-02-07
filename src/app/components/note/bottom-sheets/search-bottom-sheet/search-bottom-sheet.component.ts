import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { SearchClient } from '../../../../services/search/search.client';

@Component({
    selector: 'app-search-bottom-sheet',
    styleUrls: ['./search-bottom-sheet.component.scss'],
    templateUrl: 'search-bottom-sheet.component.html',
})
export class SearchBottomSheetComponent implements OnInit, AfterViewInit {
    private _searchText: string = '';
    constructor(
        @Inject(MAT_BOTTOM_SHEET_DATA) private data: any,
        private bottomSheetRef: MatBottomSheetRef<SearchBottomSheetComponent>,
        private searchClient: SearchClient
    ) {}

    @ViewChild('searchInput', { static: true }) public searchInputElement: ElementRef;

    public ngOnInit(): void {
        if (this.data && this.data.searchText) {
            this._searchText = this.data.searchText;
        }
    }

    public ngAfterViewInit(): void {
        this.focusSearch();
    }

    private focusSearch(): void {
        // Focus doesn't work without setTimeout
        setTimeout(() => {
            this.searchInputElement.nativeElement.focus();
        }, 0);
    }

    public get searchText(): string {
        return this._searchText;
    }

    public set searchText(v: string) {
        this._searchText = v;
    }

    public performSearch(): void {
        this.searchClient.onSearchTextChanged(this.searchText);
        this.bottomSheetRef.dismiss();
    }

    public clearSearch(): void {
        this.searchText = '';
        this.searchClient.onSearchTextChanged('');
    }
}

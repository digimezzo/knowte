import { Component, ElementRef, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import * as remote from '@electron/remote';
import { BrowserWindow } from 'electron';
import * as electronLocalShortcut from 'electron-localshortcut';
import { Notebook } from '../../data/entities/notebook';
import { SearchService } from '../../services/search/search.service';

@Component({
    selector: 'app-active-notebook-and-search',
    templateUrl: './active-notebook-and-search.component.html',
    styleUrls: ['./active-notebook-and-search.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ActiveNotebookAndSearchComponent implements OnInit {
    @ViewChild('searchInput', { static: true }) public searchInputElement: ElementRef;

    constructor(public searchService: SearchService) {}

    @Input()
    public activeNotebook: Notebook;

    @Input()
    public notesCount: number;

    public ngOnInit(): void {
        const window: BrowserWindow = remote.getCurrentWindow();

        electronLocalShortcut.register(window, 'Ctrl+F', () => {
            this.focusSearch();
        });
    }

    private focusSearch(): void {
        this.searchInputElement.nativeElement.focus();
    }
}

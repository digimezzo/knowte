import { Component, OnInit, Input, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
import { SearchService } from '../../services/search/search.service';
import { Notebook } from '../../data/entities/notebook';
import * as electronLocalshortcut from 'electron-localshortcut';
import { BrowserWindow, remote } from 'electron';

@Component({
    selector: 'app-active-notebook-and-search',
    templateUrl: './active-notebook-and-search.component.html',
    styleUrls: ['./active-notebook-and-search.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ActiveNotebookAndSearchComponent implements OnInit {
    @ViewChild('searchInput', { static: true }) public searchInputElement: ElementRef;

    constructor(public search: SearchService) {
    }

    @Input()
    public activeNotebook: Notebook;

    @Input()
    public notesCount: number;

    public ngOnInit(): void {
        const window: BrowserWindow = remote.getCurrentWindow();

        electronLocalshortcut.register(window, 'Ctrl+F', () => {
            this.focusSearch();
        });
    }

    private focusSearch(): void {
        this.searchInputElement.nativeElement.focus();
    }
}

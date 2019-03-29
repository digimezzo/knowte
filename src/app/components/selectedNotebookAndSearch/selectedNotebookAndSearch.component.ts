import { Component, OnInit, OnDestroy, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Notebook } from '../../data/entities/notebook';

@Component({
    selector: 'selectednotebookandsearch-component',
    templateUrl: './selectedNotebookAndSearch.component.html',
    styleUrls: ['./selectedNotebookAndSearch.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class SelectedNotebookAndSearchComponent implements OnInit {
    constructor(public searchService: SearchService) {
    }

    @Input()
    public selectedNotebook: Notebook;

    @Input()
    public notesCount: number;

    public ngOnInit(): void {
    }
}
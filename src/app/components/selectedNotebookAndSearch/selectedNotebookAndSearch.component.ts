import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Notebook } from '../../data/entities/notebook';

@Component({
    selector: 'selectednotebookandsearch-component',
    templateUrl: './selectedNotebookAndSearch.component.html',
    styleUrls: ['./selectedNotebookAndSearch.component.scss']
})
export class SelectedNotebookAndSearchComponent implements OnInit, OnDestroy {
    constructor(public searchService: SearchService) {
    }

    @Input()
    public selectedNotebook: string;

    @Input()
    public notesCount: number;

    ngOnDestroy(): void {
    }
    ngOnInit(): void {
    }
}
import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { Notebook } from '../../data/entities/notebook';

@Component({
    selector: 'activenotebookandsearch-component',
    templateUrl: './activeNotebookAndSearch.component.html',
    styleUrls: ['./activeNotebookAndSearch.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ActiveNotebookAndSearchComponent implements OnInit {
    constructor(public searchService: SearchService) {
    }

    @Input()
    public activeNotebook: Notebook;

    @Input()
    public notesCount: number;

    public ngOnInit(): void {
    }
}
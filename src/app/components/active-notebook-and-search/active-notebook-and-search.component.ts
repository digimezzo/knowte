import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { SearchService } from '../../services/search/search.service';
import { Notebook } from '../../data/entities/notebook';

@Component({
    selector: 'app-active-notebook-and-search',
    templateUrl: './active-notebook-and-search.component.html',
    styleUrls: ['./active-notebook-and-search.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ActiveNotebookAndSearchComponent implements OnInit {
    constructor(public search: SearchService) {
    }

    @Input()
    public activeNotebook: Notebook;

    @Input()
    public notesCount: number;

    public ngOnInit(): void {
    }
}
import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collection.service';

@Component({
    selector: 'main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {

    constructor(private collectionService: CollectionService) {
        this.hasCollections = collectionService.hasCollections;
    }

    public hasCollections: boolean;

    ngOnInit() {
    }
}
import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Subscription } from "rxjs";

@Component({
    selector: 'main-page',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    private subscription: Subscription;

    constructor(private collectionService: CollectionService) {
        this.subscription = collectionService.storageDirectoryInitialized$.subscribe((hasCollections) => this.hasCollections = hasCollections);
        this.hasCollections = collectionService.hasCollections;
    }

    public hasCollections: boolean;

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
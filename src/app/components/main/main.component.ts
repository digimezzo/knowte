import { Component, OnInit } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Subscription } from "rxjs";
import log from 'electron-log';
import { Constants } from '../../core/constants';

@Component({
    selector: 'main-page',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    private subscription: Subscription;

    constructor(private collectionService: CollectionService) {
        this.subscription = collectionService.storageDirectoryInitialized$.subscribe((hasStorageDirectory) => this.hasStorageDirectory = hasStorageDirectory);
        this.hasStorageDirectory = collectionService.hasStorageDirectory;
        log.info(`+++ Showing ${Constants.applicationName} (${Constants.applicationVersion}) main page +++`);
    }

    public hasStorageDirectory: boolean;

    ngOnInit() {
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
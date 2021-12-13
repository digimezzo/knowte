import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { remote } from 'electron';
import log from 'electron-log';
import * as path from 'path';
import { Subscription } from 'rxjs';
import { AppearanceService } from './services/appearance/appearance.service';
import { CollectionService } from './services/collection/collection.service';
import { ElectronService } from './services/electron.service';
import { TrashService } from './services/trash/trash.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();

    constructor(
        public electron: ElectronService,
        public router: Router,
        public appearance: AppearanceService,
        private collection: CollectionService,
        private trash: TrashService
    ) {
        log.create('renderer');
        log.transports.file.resolvePath = () => path.join(remote.app.getPath('userData'), 'logs', 'Knowte.log');
    }

    @ViewChild('drawer') public drawer: any;

    public ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    public ngOnInit(): void {
        this.appearance.initialize();

        this.subscription.add(
            this.trash.openTrashRequested$.subscribe(() => {
                if (this.drawer != undefined) {
                    this.drawer.toggle();
                }
            })
        );

        const showWelcome: boolean = !this.collection.hasStorageDirectory;

        if (showWelcome) {
            this.router.navigate(['/welcome']);
        }
    }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AppearanceService } from '../../services/appearance/appearance.service';
import { CollectionService } from '../../services/collection/collection.service';

@Component({
    selector: 'app-loading',
    templateUrl: './loading.component.html',
    styleUrls: ['./loading.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class LoadingComponent implements OnInit {
    constructor(private collectionService: CollectionService, public appearance: AppearanceService, public router: Router) {}

    public ngOnInit(): void {
        this.showCollection();
    }

    private async showCollection(): Promise<void> {
        await this.collectionService.initializeAsync();
        this.router.navigate(['/collection']);
    }
}

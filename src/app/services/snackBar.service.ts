import { Injectable, NgZone } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { MatSnackBar } from "@angular/material";

@Injectable({
    providedIn: 'root',
})
export class SnackBarService {
    constructor(private zone: NgZone, private translate: TranslateService, private snackBar: MatSnackBar) {
    }

    private showActionLessSnackBar(message: string, durationMillis: number) {
        this.zone.run(() => {
            this.snackBar.open(message, '', { duration: durationMillis });
        });
    }

    public collectionAdded(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionAdded').replace("{collectionName}", `'${collectionName}'`);
        this.showActionLessSnackBar(message, 2000);
    }

    public collectionActivated(collectionName: string) {
        let message: string = this.translate.instant('SnackBarMessages.CollectionActivated').replace("{collectionName}", `'${collectionName}'`);
        this.showActionLessSnackBar(message, 2000);
    }
}
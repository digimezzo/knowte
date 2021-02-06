import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class AppService {
    private _isBusy: boolean = false;

    constructor() {}

    public get isBusy(): boolean {
        return this._isBusy;
    }

    public setBusy(): void {
        this._isBusy = true;
    }

    public cancelBusy(): void {
        this._isBusy = false;
    }
}

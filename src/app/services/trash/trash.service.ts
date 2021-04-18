import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class TrashService {
    private openTrashRequested: Subject<void> = new Subject();

    constructor() {}

    public openTrashRequested$: Observable<void> = this.openTrashRequested.asObservable();

    public openTrash(): void {
        this.openTrashRequested.next();
    }
}

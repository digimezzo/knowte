import { Component, Input, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import * as remote from '@electron/remote';
import { Constants } from '../../../core/constants';
import { Utils } from '../../../core/utils';
import { Notebook } from '../../../data/entities/notebook';
import { CollectionClient } from '../../../services/collection/collection.client';
import { NoteDetailsResult } from '../../../services/results/note-details-result';

@Component({
    selector: 'app-notebook-switcher',
    templateUrl: './notebook-switcher.component.html',
    styleUrls: ['./notebook-switcher.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NotebookSwitcherComponent implements OnInit, OnDestroy {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private languageChangedListener: any = this.languageChangedHandler.bind(this);
    private notebookChangedListener: any = this.notebookChangedHandler.bind(this);

    constructor(private collectionClient: CollectionClient, private zone: NgZone) {}

    public selectedNotebookName: string;

    @Input()
    public noteId: string;
    public notebooks: Notebook[];

    public ngOnDestroy(): void {
        this.removeListeners();
    }

    public async ngOnInit(): Promise<void> {
        this.addListeners();

        // TODO: there must be a better way to know when noteId is set
        while (!this.noteId) {
            await Utils.sleep(50);
        }

        await this.getNotebookNameAsync();
    }

    private removeListeners(): void {
        this.globalEmitter.removeListener(Constants.notebookChangedEvent, this.notebookChangedListener);
        this.globalEmitter.removeListener(Constants.languageChangedEvent, this.languageChangedListener);
    }

    private addListeners(): void {
        this.globalEmitter.on(Constants.notebookChangedEvent, this.notebookChangedListener);
        this.globalEmitter.on(Constants.languageChangedEvent, this.languageChangedListener);
    }

    public async getNotebooksAsync(): Promise<void> {
        this.notebooks = await this.collectionClient.getNotebooksAsync();
    }

    public async changeNotebookAsync(notebook: Notebook): Promise<void> {
        await this.collectionClient.setNotebookAsync(notebook.id, [this.noteId]);
    }

    private getNotebooksCallback(notebooks: Notebook[]): void {
        this.notebooks = notebooks;
    }

    private async getNotebookNameAsync(): Promise<void> {
        const noteDetailsResult: NoteDetailsResult = await this.collectionClient.getNoteDetailsAsync(this.noteId);
        this.selectedNotebookName = noteDetailsResult.notebookName;
    }

    private notebookChangedHandler(noteId: string, notebookName: string): void {
        if (this.noteId === noteId) {
            this.zone.run(() => (this.selectedNotebookName = notebookName));
        }
    }

    private languageChangedHandler(): void {
        this.getNotebookNameAsync();
    }
}

import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { Utils } from '../../../common/utils/utils';
import { Notebook } from '../../../data/entities/notebook';
import { CollectionClient } from '../../../services/collection/collection.client';
import { NoteDetailsResult } from '../../../services/results/note-details-result';
import { NotebookChangedResult } from '../../../services/results/notebook-changed-result';
import { TranslatorService } from '../../../services/translator/translator.service';

@Component({
    selector: 'app-notebook-switcher',
    templateUrl: './notebook-switcher.component.html',
    styleUrls: ['./notebook-switcher.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class NotebookSwitcherComponent implements OnInit, OnDestroy {
    private subscription: Subscription = new Subscription();

    constructor(private collectionClient: CollectionClient, private translatorService: TranslatorService) {}

    public selectedNotebookName: string;

    @Input()
    public noteId: string;
    public notebooks: Notebook[];

    public ngOnDestroy(): void {
        this.removeSubscriptions();
    }

    public async ngOnInit(): Promise<void> {
        this.addSubscriptions();

        // TODO: there must be a better way to know when noteId is set
        while (!this.noteId) {
            await Utils.sleep(50);
        }

        await this.getNotebookNameAsync();
    }

    private removeSubscriptions(): void {
        this.subscription.unsubscribe();
    }

    private addSubscriptions(): void {
        this.subscription.add(
            this.collectionClient.notebookChanged$.subscribe((result: NotebookChangedResult) =>
                this.notebookChanged(result.noteId, result.notebookName)
            )
        );

        this.subscription.add(this.translatorService.languageChanged$.subscribe(async (_) => await this.getNotebookNameAsync()));
    }

    public async getNotebooksAsync(): Promise<void> {
        this.notebooks = await this.collectionClient.getNotebooksAsync();
    }

    public changeNotebook(notebook: Notebook): void {
        this.collectionClient.setNotebook(notebook.id, [this.noteId]);
    }

    private async getNotebookNameAsync(): Promise<void> {
        const noteDetailsResult: NoteDetailsResult = await this.collectionClient.getNoteDetailsAsync(this.noteId);
        this.selectedNotebookName = noteDetailsResult.notebookName;
    }

    private notebookChanged(noteId: string, notebookName: string): void {
        if (this.noteId === noteId) {
            this.selectedNotebookName = notebookName;
        }
    }
}

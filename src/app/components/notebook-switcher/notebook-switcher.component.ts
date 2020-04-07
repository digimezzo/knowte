import { Component, OnInit, OnDestroy, ViewEncapsulation, Input, NgZone } from '@angular/core';
import { Notebook } from '../../data/entities/notebook';
import { remote } from 'electron';
import { Constants } from '../../core/constants';
import { NoteDetailsResult } from '../../services/results/note-details-result';
import { Utils } from '../../core/utils';

@Component({
    selector: 'app-notebook-switcher',
    templateUrl: './notebook-switcher.component.html',
    styleUrls: ['./notebook-switcher.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NotebookSwitcherComponent implements OnInit, OnDestroy {
    private globalEmitter: any = remote.getGlobal('globalEmitter');
    private languageChangedListener: any = this.languageChangedHandler.bind(this);
    private notebookChangedListener: any = this.notebookChangedHandler.bind(this);

    constructor(private zone: NgZone) {
    }

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

        this.getNotebookName();
    }

    private removeListeners(): void {
        this.globalEmitter.removeListener(Constants.notebookChangedEvent, this.notebookChangedListener);
        this.globalEmitter.removeListener(Constants.languageChangedEvent, this.languageChangedListener);
    }

    private addListeners(): void {
        this.globalEmitter.on(Constants.notebookChangedEvent, this.notebookChangedListener);
        this.globalEmitter.on(Constants.languageChangedEvent, this.languageChangedListener);
    }

    public getNotebooks(): void {
        this.globalEmitter.emit(Constants.getNotebooksEvent, this.getNotebooksCallback.bind(this));
    }

    public changeNotebook(notebook: Notebook): void {
        this.globalEmitter.emit(Constants.setNotebookEvent, notebook.id, [this.noteId]);
    }

    private getNotebookName(): void {
        this.globalEmitter.emit(Constants.getNoteDetailsEvent, this.noteId, this.getNotebookNameCallback.bind(this));
    }

    private getNotebooksCallback(notebooks: Notebook[]): void {
        this.notebooks = notebooks;
    }

    private getNotebookNameCallback(result: NoteDetailsResult): void {
        this.zone.run(() => {
            this.selectedNotebookName = result.notebookName;
        });
    }

    private notebookChangedHandler(noteId: string, notebookName: string): void {
        if (this.noteId === noteId) {
            this.zone.run(() => this.selectedNotebookName = notebookName);
        }
    }

    private languageChangedHandler(noteId: string): void {
        this.getNotebookName();
    }
}

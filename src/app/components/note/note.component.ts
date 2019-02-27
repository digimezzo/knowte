import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener, NgZone } from '@angular/core';
import { remote } from 'electron';
import { ActivatedRoute } from '@angular/router';
import { NoteDetailsResult } from '../../services/results/noteDetailsResult';
import log from 'electron-log';
import { MatDialog, MatDialogRef } from '@angular/material';
import { ChangeNotebookDialogComponent } from '../dialogs/changeNotebookDialog/changeNotebookDialog.component';
import { Constants } from '../../core/constants';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit, OnDestroy {
    constructor(private activatedRoute: ActivatedRoute, private zone: NgZone,
        private dialog: MatDialog) {
    }

    private globalEmitter = remote.getGlobal('globalEmitter');
    private noteId: string;
    public noteTitle: string;
    public notebookName: string;
    public isMarked: boolean;

    private setNoteDetailsListener: any = this.setNoteDetails.bind(this);

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        this.globalEmitter.emit(Constants.setNoteOpenEvent, this.noteId, false);
        this.globalEmitter.removeListener(`${Constants.sendNoteDetailsEvent}-${this.noteId}`, this.setNoteDetailsListener);
    }

    ngOnDestroy() {
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
            this.globalEmitter.on(`${Constants.sendNoteDetailsEvent}-${this.noteId}`, this.setNoteDetailsListener);
            this.globalEmitter.emit(Constants.setNoteOpenEvent, this.noteId, true);
        });
    }

    private setNoteDetails(result: NoteDetailsResult) {
        this.zone.run(() => {
            this.noteTitle = result.noteTitle;
            this.notebookName = result.notebookName;
            this.isMarked = result.isMarked;
        });
    }

    private handleNoteMarkToggled(isNoteMarked: boolean) {
        this.zone.run(() => this.isMarked = isNoteMarked);
    }

    public changeNotebook(): void {
        let dialogRef: MatDialogRef<ChangeNotebookDialogComponent> = this.dialog.open(ChangeNotebookDialogComponent, {
            width: '450px', data: { noteId: this.noteId }
        });
    }

    public toggleNoteMark(): void {
        this.globalEmitter.emit(Constants.toggleNoteMarkEvent, this.noteId);
    }

    public onNotetitleChange(newNoteTitle: string) {

    }
}

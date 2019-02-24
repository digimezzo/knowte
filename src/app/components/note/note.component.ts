import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener, NgZone } from '@angular/core';
import { remote } from 'electron';
import { ActivatedRoute } from '@angular/router';
import { NoteDetailsResult } from '../../services/results/noteDetailsResult';
import log from 'electron-log';
import { Constants } from '../../core/constants';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit, OnDestroy {
    constructor(private activatedRoute: ActivatedRoute, private zone: NgZone) {
    }

    private globalEvents = remote.getGlobal('globalEvents');
    private noteId: string;
    public noteTitle: string;
    public notebookName: string;
    public isMarked: boolean;

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        this.globalEvents.emit(Constants.setNoteOpenEvent, this.noteId, false);
    }

    ngOnDestroy() {
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
        });

        this.globalEvents.on(`${Constants.noteDetailsFetchedEvent}-${this.noteId}`, (result) => this.handleNoteDetailsFetched(result));
        this.globalEvents.on(`noteMarkToggled-${this.noteId}`, (isNoteMarked) => this.handleNoteMarkToggled(isNoteMarked));

        this.globalEvents.emit(Constants.setNoteOpenEvent, this.noteId, true);
    }

    private handleNoteDetailsFetched(result: NoteDetailsResult) {
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

    }

    public toggleNoteMark(): void {
        this.globalEvents.emit(Constants.toggleNoteMarkEvent, this.noteId);
    }

    public onNotetitleChange(newNoteTitle: string) {

    }
}

import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener } from '@angular/core';
import { remote } from 'electron';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'note-content',
    templateUrl: './note.component.html',
    styleUrls: ['./note.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NoteComponent implements OnInit, OnDestroy {
    constructor(private activatedRoute: ActivatedRoute) {
    }

    private globalEvents = remote.getGlobal('globalEvents');
    private noteId: string;

    // ngOndestroy doesn't tell us when a note window is closed, so we use this event instead.
    @HostListener('window:beforeunload', ['$event'])
    beforeunloadHandler(event) {
        this.globalEvents.emit('noteOpenChanged', this.noteId, false);
    }

    ngOnInit() {
        this.activatedRoute.queryParams.subscribe(async (params) => {
            this.noteId = params['id'];
        });

        this.globalEvents.emit('noteOpenChanged', this.noteId, true);
    }

    ngOnDestroy() {
    }

    public toggleNoteMark(): void {

    }

    public onNotetitleChange(newNoteTitle: string) {

    }
}

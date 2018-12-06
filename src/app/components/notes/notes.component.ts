import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import log from 'electron-log';
import { Notebook } from '../../data/notebook';

@Component({
  selector: 'notes-page',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit {
  constructor(private collectionService: CollectionService) {
  }

  public allNotesCount: number = 0;
  public todayNotesCount: number = 0;
  public yesterdayNotesCount: number = 0;
  public thisWeekNotesCount: number = 0;
  public markedNotesCount: number = 0;

  public notebooks: Notebook[];

  ngOnInit() {
    log.info("Showing notes page");

    this.notebooks = this.collectionService.getNotebooks();
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import { Constants } from '../../core/constants';
import { Notebook } from '../../data/entities/notebook';
import log from 'electron-log';
import { NoteService } from '../../services/note.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
})
export class BackButtonComponent implements OnInit, OnDestroy {
  constructor(public router: Router, private collectionService: CollectionService, private noteService: NoteService, private activatedRoute: ActivatedRoute) {
  }

  private subscription: Subscription;
  public applicationName: string = Constants.applicationName;
  public notebook: Notebook;
  private noteId: string;

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      this.noteId = params['id'];

      if (this.noteId) {
        await this.getNotebookAsync();
        this.subscription = this.noteService.notebookChanged$.subscribe(async() => await this.getNotebookAsync());
      }
    });
  }

  private async getNotebookAsync(){
    this.notebook = await this.collectionService.getNotebookAsync(this.noteId);
  }

  public goToNotes(): void {
    this.router.navigate(['/collection']);
  }

  public changeNotebook(): void {
    if (this.noteId) {
      this.noteService.OnChangeNotebook(this.noteId);
    }
  }
}
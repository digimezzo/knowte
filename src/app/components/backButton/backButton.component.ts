import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import { Subscription } from 'rxjs';
import { Constants } from '../../core/constants';
import { Notebook } from '../../data/entities/notebook';
import log from 'electron-log';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
})
export class BackButtonComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(public router: Router, private collectionService: CollectionService, private activatedRoute: ActivatedRoute) {
  }

  public applicationName: string = Constants.applicationName;
  public notebook: Notebook;

  ngOnDestroy() {
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async (params) => {
      let noteId: string = params['id'];
      log.info(`Note with id=${noteId}.`);
      if (noteId) {
        this.notebook = await this.collectionService.getNotebookAsync(noteId);
      }
    });
  }

  public goToNotes(): void {
    this.router.navigate(['/collection']);
  }

  public changeNotebook(): void {
    log.info("CHANGE NOTEBOOK");
  }
}
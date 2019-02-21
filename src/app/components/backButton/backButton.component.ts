import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import { Constants } from '../../core/constants';
import { Notebook } from '../../data/entities/notebook';
import log from 'electron-log';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
})
export class BackButtonComponent implements OnInit, OnDestroy {
  constructor(public router: Router, private collectionService: CollectionService, private activatedRoute: ActivatedRoute) {
  }

  public applicationName: string = Constants.applicationName;
  public notebook: Notebook;
  private noteId: string;

  ngOnDestroy() {
  }

  ngOnInit() {
  }

  public goToNotes(): void {
    this.router.navigate(['/collection']);
  }
}
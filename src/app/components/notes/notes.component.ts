import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Constants } from '../../core/constants';


@Component({
  selector: 'notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit {
  constructor(collectionService: CollectionService) { 
    this.hasCollections = collectionService.hasCollections;
  }

  public hasCollections: boolean;
  public applicationName: string = Constants.applicationName.toUpperCase();

  ngOnInit() {
  }
}

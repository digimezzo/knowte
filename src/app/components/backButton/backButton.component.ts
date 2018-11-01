import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
})
export class BackButtonComponent implements OnInit {
  constructor(public router: Router, private collectionService: CollectionService) {
    this.hasCollections = collectionService.hasCollections;
  }

  public hasCollections: boolean;

  ngOnInit() {
  }

  public goToNotes(): void {
    this.router.navigate(['/notes']);
  }
}
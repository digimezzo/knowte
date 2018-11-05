import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
})
export class BackButtonComponent implements OnInit {
  private subscription: Subscription;

  constructor(public router: Router, private collectionService: CollectionService) {
    this.subscription = collectionService.storageDirectoryInitialized$.subscribe((hasCollections) => this.hasCollections = hasCollections);
    this.hasCollections = collectionService.hasCollections;
  }

  public hasCollections: boolean;

  ngOnInit() {
  }

  public goToMain(): void {
    this.router.navigate(['/main']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
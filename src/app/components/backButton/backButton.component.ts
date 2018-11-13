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
    this.subscription = this.collectionService.storageDirectoryChanged$.subscribe((hasStorageDirectory) => this.hasStorageDirectory = hasStorageDirectory);
    this.hasStorageDirectory = this.collectionService.hasStorageDirectory();
  }

  public hasStorageDirectory: boolean;

  ngOnInit() {
  }

  public goToMain(): void {
    this.router.navigate(['/main']);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
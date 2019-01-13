import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import { Subscription } from 'rxjs';
import { Constants } from '../../core/constants';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
})
export class BackButtonComponent implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(public router: Router, private collectionService: CollectionService) {
  }

  public applicationName: string = Constants.applicationName.toUpperCase();

  ngOnInit() {
  }

  public goToNotes(): void {
    this.router.navigate(['/notes']);
  }

  ngOnDestroy() {
  }
}
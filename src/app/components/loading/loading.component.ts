import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import log from 'electron-log';
import { Utils } from '../../core/utils';

@Component({
  selector: 'loading-page',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoadingComponent implements OnInit {
  constructor(private collectionService: CollectionService, public router: Router) {
  }

  ngOnInit() {
    this.showCollection();
  }

  private async showCollection(): Promise<void> {
    await this.collectionService.initializeAsync();
    this.router.navigate(['/collection']);
  }
}
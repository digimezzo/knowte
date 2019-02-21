import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection.service';
import log from 'electron-log';

@Component({
  selector: 'loading-page',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  constructor(private collectionService: CollectionService, public router: Router) {
  }

  ngOnInit() {
    log.info(`Loading`);
    this.showCollection();
  }

  private async showCollection(): Promise<void> {
    await this.collectionService.initializeDataStoreAsync();
    this.router.navigate(['/collection']);
  }
}
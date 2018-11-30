import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CollectionService } from '../../services/collection.service';

@Component({
  selector: 'loading-page',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  constructor(private collectionService: CollectionService, public router: Router) {
  }

  ngOnInit() {
    this.showMain();
  }

  private async showMain(): Promise<void> {
    await this.collectionService.initializeDataStoreAsync();
    this.router.navigate(['/main']);
  }
}
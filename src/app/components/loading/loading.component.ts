import { Component, OnInit } from '@angular/core';
import { DataStore } from '../../data/dataStore';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { Utils } from '../../core/utils';

@Component({
  selector: 'loading-page',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {
  constructor(private dataStore: DataStore, public router: Router) {
  }

  ngOnInit() {
    this.dataStore.initialize(this.showMain.bind(this));
  }

  private async showMain(): Promise<void> {
    //await Utils.sleep(5000);
    this.router.navigate(['/main']);
  }
}
import { Component, OnInit } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { CollectionService } from './services/collection/collection.service';
import { Router } from '@angular/router';
import { AppearanceService } from './services/appearance/appearance.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public electron: ElectronService, public router: Router, public appearance: AppearanceService,
    private collection: CollectionService) {
  }

  public ngOnInit(): void {
    const showWelcome: boolean = !this.collection.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { CollectionService } from './services/collection/collection.service';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { AppearanceService } from './services/appearance/appearance.service';
import { remote } from 'electron';
import { Constants } from './core/constants';
import { Settings } from './core/settings';
import { TranslatorService } from './services/translator/translator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(public electron: ElectronService, public router: Router, public appearance: AppearanceService,
    private translator: TranslatorService, private collection: CollectionService,
    private settings: Settings, private overlayContainer: OverlayContainer) {
  }

  public ngOnInit(): void {
    let showWelcome: boolean = !this.collection.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
    }
  }
}

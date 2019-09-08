import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { CollectionService } from './services/collection/collection.service';
import { Router } from '@angular/router';
import { AppearanceService } from './services/appearance/appearance.service';
import { TranslatorService } from './services/translator/translator.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electron: ElectronService, public router: Router, private appearance: AppearanceService,
    private translator: TranslatorService, private collection: CollectionService) {

    this.appearance.applyTheme();
    this.translator.applyLanguage();
  }

  public selectedTheme: string;

  public ngOnDestroy(): void {
  }

  public ngOnInit(): void {
    let showWelcome: boolean = !this.collection.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
    }
  }
}

import { Component } from '@angular/core';
import { ElectronService } from './services/electron.service';
import { TranslateService } from '@ngx-translate/core';
import { AppConfig } from '../environments/environment';
import { CollectionService } from './services/collection.service';
import log from 'electron-log';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService, public router: Router,
    private translate: TranslateService, private collectionService: CollectionService) {

    translate.setDefaultLang('en'); translate.setDefaultLang('en');
    console.log('AppConfig', AppConfig);

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }

  ngOnInit() {
    let showWelcome: boolean = !this.collectionService.hasStorageDirectory;

    if (showWelcome) {
      this.router.navigate(['/welcome']);
      // }else if(!this.collectionService.hasDataStore){
      //   log.info("Got no data store");
      //   this.router.navigate(['/loading']);
    } else {
      this.router.navigate(['/loading']);
    }
  }

  ngOnDestroy() {
  }
}

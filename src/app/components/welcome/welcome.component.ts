import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { remote } from 'electron';
import log from 'electron-log';
import { Constants } from '../../core/constants';

@Component({
  selector: 'welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss']
})
export class WelcomeComponent implements OnInit {

  constructor(private translate: TranslateService) { 
  }

  public applicationName: string = Constants.applicationName.toUpperCase();

  ngOnInit() {
  }

  public openDirectoryChooser(): void {
    log.info("Opening directory chooser");

    remote.dialog.showOpenDialog({ title: this.translate.instant('DialogTitles.SelectFolder'), properties: ['openDirectory'] }, (folderPath) => {
      if (folderPath === undefined) {
        log.warn("No folder was selected");
        return;
      }
      
      log.info(`Selected directory: '${folderPath}'`);
      // this.folder = folderPath;
    });
  }
}

import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CollectionService } from '../../services/collection.service';
import { Constants } from '../../core/constants';
import { remote } from 'electron';
import log from 'electron-log';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit {
  constructor(private collectionService: CollectionService, private translate: TranslateService) {
    this.hasCollections = collectionService.hasCollections;
  }

  public hasCollections: boolean;
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

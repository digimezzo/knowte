import { Component, OnInit } from '@angular/core';
import log from 'electron-log';
@Component({
  selector: 'settings-page',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  constructor() { 
    log.info("Showing settings page");
  }

  ngOnInit() {
  }
}

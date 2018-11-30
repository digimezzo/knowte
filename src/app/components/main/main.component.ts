import { Component, OnInit } from '@angular/core';
import log from 'electron-log';
import { Constants } from '../../core/constants';

@Component({
    selector: 'main-page',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit {
    constructor() {
    }

    ngOnInit() {
        log.info(`+++ Showing ${Constants.applicationName} (${Constants.applicationVersion}) main page +++`);
    }
}
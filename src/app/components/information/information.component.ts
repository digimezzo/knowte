import { Component, OnInit } from '@angular/core';
import { Constants } from '../../core/constants';

@Component({
  selector: 'information-component',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  private _applicationName: string;

  constructor() {
   this.applicationName = Constants.applicationName.toUpperCase();
  }

  ngOnInit() {
  }

  public get applicationName(): string {
    return this._applicationName;
  }

  public set applicationName(v: string) {
    this._applicationName = v;
  }
}

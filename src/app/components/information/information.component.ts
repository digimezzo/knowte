import { Component, OnInit } from '@angular/core';
import { Constants } from '../../core/constants';

@Component({
  selector: 'information-component',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {

  public applicationName: string;
  public applicationVersion: string;
  public applicationCopyright: string;

  constructor() {
   this.applicationName = Constants.applicationName.toUpperCase();
   this.applicationVersion = Constants.applicationVersion;
   this.applicationCopyright = Constants.applicationCopyright;
  }

  ngOnInit() {
  }
}

import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Constants } from '../../core/constants';

@Component({
  selector: 'logo-full',
  templateUrl: './logoFull.component.html',
  styleUrls: ['./logoFull.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LogoFullComponent implements OnInit {
  constructor() {
  }

  public applicationName: string = Constants.applicationName.toUpperCase();
  @Input() textColor: string;

  ngOnInit() {
  }
}
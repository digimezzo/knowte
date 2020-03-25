import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Constants } from '../../core/constants';

@Component({
  selector: 'app-logo-full',
  host: { 'style': 'display: block' },
  templateUrl: './logo-full.component.html',
  styleUrls: ['./logo-full.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LogoFullComponent implements OnInit {
  constructor() {
  }

  @Input() public textColor: string;
  public applicationName: string = Constants.applicationName.toUpperCase();

  public ngOnInit(): void {
  }
}

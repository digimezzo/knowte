import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'app-logo-menu',
  host: { 'style': 'display: block' },
  templateUrl: './logo-menu.component.html',
  styleUrls: ['./logo-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LogoMenuComponent implements OnInit {
  constructor() {
  }

  @Input() public selectedMenuItem: number;

  public ngOnInit(): void {
  }
}

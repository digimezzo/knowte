import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'logo-menu',
  host: { 'style': 'display: block' },
  templateUrl: './logo-menu.component.html',
  styleUrls: ['./logo-menu.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LogoMenuComponent implements OnInit {
  constructor() {
  }

  @Input() selectedMenuItem: number;

  public ngOnInit(): void {
  }
}
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class BackButtonComponent implements OnInit, OnDestroy {
  constructor(public router: Router) {
  }

  ngOnDestroy() {
  }

  ngOnInit() {
  }

  public goToNotes(): void {
    this.router.navigate(['/collection']);
  }
}
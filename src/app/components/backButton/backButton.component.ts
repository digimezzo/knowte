import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
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
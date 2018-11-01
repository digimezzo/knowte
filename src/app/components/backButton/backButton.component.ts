import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'back-button',
  templateUrl: './backButton.component.html',
  styleUrls: ['./backButton.component.scss']
})
export class BackButtonComponent implements OnInit {
  constructor(public router: Router) {
  }

  ngOnInit() {
  }

  public goToNotes(): void {
    this.router.navigate(['/notes']);
  }
}
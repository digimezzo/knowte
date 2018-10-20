import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'notes-component',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class NotesComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}

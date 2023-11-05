import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-viewusers',
  templateUrl: './viewusers.component.html',
  styleUrls: ['./viewusers.component.css']
})
export class ViewusersComponent implements OnInit {
  items = ["1", "2", "3", "4"];
  constructor() { }

  ngOnInit(): void {
  }

}

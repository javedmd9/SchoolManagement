import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-viewadagencys',
  templateUrl: './viewadagencys.component.html',
  styleUrls: ['./viewadagencys.component.css']
})
export class ViewadagencysComponent implements OnInit {
  items = ["1", "2", "3", "4"];
  constructor() { }

  ngOnInit(): void {
  }

}

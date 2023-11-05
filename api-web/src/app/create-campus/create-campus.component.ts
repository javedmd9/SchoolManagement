import { Component, OnInit } from '@angular/core';
import { data } from 'jquery';
import { CampusService } from '../campus.service';
import { Campus } from '../model/campus.model';

@Component({
  selector: 'app-create-campus',
  templateUrl: './create-campus.component.html',
  styleUrls: ['./create-campus.component.css']
})
export class CreateCampusComponent implements OnInit {

  // campus: Campus = new Campus(0,"","","","","",0);
  message: string;

  constructor(private campusService: CampusService) { }

  ngOnInit(): void {
  }

  public saveCampus(){
    // let response = this.campusService.addCampus(this.campus);
    // console.log(this.campus);
    // response.subscribe((data:any) => this.message = data);
  }

}

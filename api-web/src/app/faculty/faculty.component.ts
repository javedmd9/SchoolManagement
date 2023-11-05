import { Component, OnInit } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { data } from 'jquery';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { FacultyDto } from './faculty.model';

@Component({
  selector: 'app-faculty',
  templateUrl: './faculty.component.html',
  styleUrls: ['./faculty.component.css']
})
export class FacultyComponent implements OnInit {

  constructor(private facultyService: CampusService, private modalService: NgbModal) { }

  faculty: FacultyDto = new FacultyDto();
  viewFaculty: FacultyDto = new FacultyDto();
  filterFaculty: FacultyDto = new FacultyDto();
  facultyList: FacultyDto[] = new Array();
  facultyListByName: FacultyDto[] = new Array();
  closeResult: string;
  message: string;
  selectedValue: string;
  status1: any
  // selectedStatus: Status = new Status("ACTIVE", "Active");
  // statuses: Array<Status> = [{ statusID: "ACTIVE", statusName: "Active" }, { statusID: "INACTIVE", statusName: "In Active" }];

  // onSelect(statusId: any) {
  //   this.selectedStatus = null;
  //   for (var i = 0; i < this.statuses.length; i++) {
  //     if (this.statuses[i].statusID == statusId) {
  //       this.selectedStatus = this.statuses[i];
  //     }
  //   }
  // }
  // open create campus model
  onOptionsSelected(value: string) {
    console.log("the selected value is " + value);
    value == '1'? this.selectedValue = 'Graduation': this.selectedValue = 'Post Graduation';

  }

  open(createContent: any) {
    this.modalService.open(createContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  // end //

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }
  dismissModel() {
    this.modalService.dismissAll();
  }
  // open update campus model //
  editModal(updateContent: any, id: number) {
    let response = this.facultyService.viewFaculty(id);
    response.subscribe((data: any) => {
      this.viewFaculty = data;
      console.log(this.viewFaculty)
    });
    this.modalService.open(updateContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }
  // end //

  ngOnInit(): void {
    let response = this.facultyService.getFacultyList();
    response.subscribe((data: any) => {
      // this.facultyList = data;
      for (var i of data) {
        this.facultyList.push(i);
      }
    });
    while (this.facultyList.length) {
      console.log("deleteing all faculty list.");
      this.facultyList.pop();
    }
    this.facultiesByName();
    this.filterFaculty.status="ACTIVE";
    this.filterFaculty.level="1";
  }

  //-- view faculty model--// 
  public viewAllFaculty() {
    while(this.facultyList.length){
      this.facultyList.pop();
    }
    let response = this.facultyService.getFacultyList();
    response.subscribe((data:any) => {
      for(var i of data){
        if(i == 0){
          this.facultyList = Array(i)
        } else{
          this.facultyList.push(i);
        }
      }
    });
    this.filterFaculty.status="ACTIVE";
    this.filterFaculty.level="1";
    console.log("All Faculty List");
  }
  // - view campus model end -- //
  public facultiesByName(){
    let response = this.facultyService.facultyListByName();
    response.subscribe((data:any) => {
      this.facultyListByName = data;
    });
  }
  // public criteriaView(){
  //   let response = this.campusservice.getCampusList();
  //   response.subscribe((data)=>{this.campuses1 = data; console.log(this.campuses1)});
  // }

  public getFilteredFaculty() {
    this.filterFaculty.level = this.selectedValue;
    let response = this.facultyService.getFilteredFaculty(this.filterFaculty);
    response.subscribe((data) => {
      this.facultyList = data["content"];
      console.log(data['content']);
    });
    console.log(this.facultyList);
  }
  // -- delete campus model -- //
  public deleteFaculty(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete the record?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // your code for deletion, etc.
        let response = this.facultyService.deleteFaculty(id);
        response.subscribe((data: any) => {
          this.message = data;
          console.log(this.message);
          this.facultyList = this.facultyList.filter(item => item.id !== id);
        });
        Swal.fire('Saved!', '', 'success')
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    });

    // this.viewAllFaculty();
  }
  // -- delete faculty model end -- //


  // -- add campus model -- //
  public saveFaculty() {
    this.faculty.level = this.selectedValue;
    let response = this.facultyService.addFaculty(this.faculty);
    response.subscribe((data: any) => this.facultyList = data);
    console.log("Saved new Faculty");
    this.modalService.dismissAll();
  }
  // -- add campus model end -- //



  // public editFaculty(id: number) {
  //   let response = this.facultyService.viewFaculty(id);
  //   response.subscribe((data: any) => {
  //     this.faculty = data;
  //     console.log(this.faculty)
  //   });

  // }

  // -- update faculty model -- //
  public updateFaculty() {
    Swal.fire({
      title: 'Are you sure you want to update the record of \n' + this.viewFaculty.name,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        this.viewFaculty.level = this.selectedValue;
        let response = this.facultyService.updateFaculty(this.viewFaculty);
        response.subscribe((data: any) => {
          this.message = data;
          let itemIndex = this.facultyList.findIndex(item => item.id == this.viewFaculty.id);
          this.facultyList[itemIndex] = this.viewFaculty;
        });
        console.log("Updated faculty.");
        console.log(this.message);
        this.modalService.dismissAll();
        Swal.fire('Saved!', '', 'success')
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    });

  }
  // -- update faculty model end -- //

}

import { Component, OnInit } from '@angular/core';
import { data } from 'jquery';
import { Observable, Subscription } from 'rxjs';
import { CampusService } from '../campus.service';
import { Campus } from '../model/campus.model';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-view-campus',
  templateUrl: './view-campus.component.html',
  styleUrls: ['./view-campus.component.css']
})


export class ViewCampusComponent implements OnInit {

  constructor(private campusservice: CampusService, private modalService: NgbModal) { }

  viewCampus: Campus = new Campus();

  campuses: Campus[] = new Array();
  campuses1: Campus[] = new Array();
  campus: Campus = new Campus();
  campusId: number;
  closeResult: string;
  message: string;
  totalElements: number = 0;

  // open create campus model
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
    let response = this.campusservice.viewCampus(id);
    response.subscribe((data: any) => {
      this.viewCampus = data;
      console.log(this.viewCampus)
    });
    this.modalService.open(updateContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }
  // end //

  ngOnInit(): void {
    // let response = this.campusservice.getCampusList();
    // response.subscribe((data: any) => {
    //   for (var i of data) {
    //     this.campuses.push(i);
    //   };
    // });
    // while (this.campuses.length) {
    //   this.campuses.pop();
    // }
    this.campus.city = "";
    this.campus.name = "";
    this.criteriaView();
    this.getFilteredCampus();

  }


  //-- view campus model--// 
  public viewAllCampus() {
    let response = this.campusservice.getCampusList();
    response.subscribe((data: any) => {
      this.campuses = data;
      console.log(this.campuses)
    });
  }
  // - view campus model end -- //

  public criteriaView() {
    let response = this.campusservice.getCampusList();
    response.subscribe((data: any) => {
      this.campuses1 = data;
      console.log(this.campuses1)
    });
  }

  /* 
  =========== Template Dialog box of sweet alert=============

  Swal.fire({
      title: 'Are you sure you want to delete the record?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // your code for deletion, etc.
        
        Swal.fire('Saved!', '', 'success')
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    });
  */

    pages: Array<number>;
    page: number;
    setPage(i,event){
      event.preventDefault();
      this.campus.pageNumber = i;
      this.getFilteredCampus();
    }
  public getFilteredCampus() {
    let response = this.campusservice.getFilteredCampus(this.campus);
    response.subscribe((data) => {
      this.campuses = data["content"];
      this.pages = new Array(data["totalPages"]);
      console.log(this.pages);
      console.log(data['content']);
    });
    console.log(this.campuses);
  }
  // -- delete campus model -- //
  public deleteCampus(id: number) {
    Swal.fire({
      title: 'Are you sure you want to delete the record?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        let response = this.campusservice.deleteCampus(id);
        response.subscribe((data: any) => {
          this.message = data;
          console.log(this.message);
          if (this.message == 'Success') {
            this.campuses = this.campuses.filter(item => item.id != id);
            console.log("Deleted Campus.");
          } else {
            result.isDenied;
            Swal.fire('Sorry!\n unable to deleted.', '', 'info')
          }

        });
        Swal.fire('Saved!', '', 'success')
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    });
    // this.viewAllCampus();
  }
  // -- delete campus model end -- //


  // -- add campus model -- //
  public saveCampus() {
    let response = this.campusservice.addCampus(this.campus);
    response.subscribe((data: any) => this.campuses = data);
    console.log("Save new campus");
    this.modalService.dismissAll();
  }
  // -- add campus model end -- //



  // public editCampus(id: number) {
  //   let response = this.campusservice.viewCampus(id);
  //   response.subscribe((data: any) => {
  //     this.campus = data;
  //     console.log(this.campus)
  //   });

  // }

  // -- save campus model -- //
  public updateCampus() {
    Swal.fire({
      title: 'Are you sure you want to update the record of ' + this.viewCampus.name,
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // your code for deletion, etc.
        let response = this.campusservice.updateCampus(this.viewCampus);
        response.subscribe((data: any) => {
          this.message = data;
          let itemIndex = this.campuses.findIndex(item => item.id == this.viewCampus.id);
          this.campuses[itemIndex] = this.viewCampus;
        });
        console.log("Updated campus.");
        console.log(this.message);
        this.modalService.dismissAll();
        Swal.fire('Saved!', '', 'success')
      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info')
      }
    });

  }
  // -- save campus model end -- //

}

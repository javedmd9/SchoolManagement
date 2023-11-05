import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CampusService } from '../campus.service';
import { AuthRequestDto } from '../security/authRequestDto.model';
import { LeaveRequestDto, UserDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-leave-request',
  templateUrl: './leave-request.component.html',
  styleUrls: ['./leave-request.component.css']
})
export class LeaveRequestComponent implements OnInit {

  constructor(private service: CampusService, private modalService: NgbModal) { }

  leaveRequestList: LeaveRequestDto[] = [];

  ngOnInit(): void {
    this.getLoggedInUserDetail();
    this.getAllLeaveRequest();

    this.initializeviewApplicationModal()
  }

  userData: UserDto;
  itemPerPage: number;
  private getAllLeaveRequest() {
    let dto: LeaveRequestDto = {
      pageNo: 0
    }
    let response = this.service.getAllLeaveRequest(dto);
    response.subscribe((data: any) => {
      this.leaveRequestList = data["content"];
      this.pages = data["totalElements"]
      this.p = data["number"] + 1;
      this.itemPerPage = data["numberOfElements"];
    });
  }

  getLoggedInUserDetail(){
    let userData = JSON.parse(localStorage.getItem("UserData"));
    console.log("User Deatial: ", userData);
    let response = this.service.findUserByUsername(userData.username);
    response.subscribe((data:any) => {
      this.userData = data;
    });
  }

  closeResult: string;
  openViewLeaveApplicationModel(createContent:any, rowData: LeaveRequestDto){
    this.setRowDataInModal(rowData);
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  viewApplicationRequest: FormGroup;
  initializeviewApplicationModal(){
    this.viewApplicationRequest = new FormGroup({
      'leaveid': new FormControl(null, Validators.required),
      'appsubject': new FormControl(null, Validators.required),
      'appmessage': new FormControl(null, Validators.required)
    });
  }

  setRowDataInModal(rowData: LeaveRequestDto){
    this.viewApplicationRequest.patchValue({
      leaveid: rowData.id,
      appsubject: rowData.letterSubject,
      appmessage: rowData.letterBody
    });
  }

  approveApplication(){
    let dto: LeaveRequestDto = {
      id: this.viewApplicationRequest.value.leaveid
    }
    this.approveLeaveRequest(dto);
  }

  rejectApplication(){
    let dto: LeaveRequestDto = {
      id: this.viewApplicationRequest.value.leaveid
    }
    this.rejectLeaveRequest(dto);
  }

  rejectLeaveRequest(rowData: LeaveRequestDto){
    let dto: LeaveRequestDto = {
      id: rowData.id,
      approvedBy: this.userData.userId.toString()
    }
    let response = this.service.rejectStudentLeaveRequest(dto);
    response.subscribe((data:any) => {
      this.service.fireSwalToast(data.message);
      this.getAllLeaveRequest();
    });
    this.modalService.dismissAll();
  }

  approveLeaveRequest(rowData: LeaveRequestDto){
    let dto: LeaveRequestDto = {
      id: rowData.id,
      approvedBy: this.userData.userId.toString()
    }
    let response = this.service.approveStudentLeaveRequest(dto);
    response.subscribe((data:any) => {
      this.service.fireSwalToast(data.message);
      this.getAllLeaveRequest();
    });
    this.modalService.dismissAll();
  }

  p: number = 0;
  pages: number = 0;
  pageChangeEvent(event) {
    this.p = event;
    console.log("Page: ", this.p);
    let studentData: LeaveRequestDto = {
      pageNo: event - 1
    }
    let response = this.service.getAllLeaveRequest(studentData);
    response.subscribe((data:any) => {
      this.leaveRequestList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      console.log(data);
    });
  }

}

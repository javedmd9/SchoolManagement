import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { AssignSubjectsTeacherDto, CertificateDto, LeaveRequestDto, TeacherDto, TimeTableReport } from '../teachers/teacher.model';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {

  constructor(private modalService: NgbModal, private teacherService: CampusService, private routes: ActivatedRoute) { }

  teachercode: number;
  ngOnInit() {
    // this.initializeEditFormData();
    let userData = JSON.parse(localStorage.getItem("UserData"));
    if(userData.roles.name.includes("TEACHER")){
      let response = this.teacherService.findUserByUsername(userData.username);
      response.subscribe((data:any) => {
        this.findTeacher(Number(data.teacherCode));
      });
    }
    this.routes.queryParams.subscribe((params:any) => {
      this.teachercode = params.teacherCode;
      // console.log(this.teachercode);
      this.findTeacher(Number(this.teachercode));
    });
    this.initializeLeaveApplicationForm();
    this.initializeviewApplicationModal();
  }

  editTeacherForm: FormGroup;
  initializeEditFormData() {
    this.editTeacherForm = new FormGroup({
      'teachercode': new FormControl(null),
      'teachername': new FormControl(null),
      'mobilenumber': new FormControl(null),
      'adharnumber': new FormControl(null),
      'dob': new FormControl(null),
      'tqualification': new FormControl(null),
      'mathsci': new FormControl(null),
      'english': new FormControl(null),
      'social': new FormControl(null),
      'doj': new FormControl(null),
      'confirmdate': new FormControl(null),
      'nappointment': new FormControl(null),
      'temail': new FormControl(null),
      'gender': new FormControl(null),
      'tcategory': new FormControl(null),
      'designation': new FormControl(null),
      'appointedsubject': new FormControl(null),
      'ifsc': new FormControl(null),
      'accountno': new FormControl(null),
      'panno': new FormControl(null)
    });
  }

  teacherData: TeacherDto = new TeacherDto();
  public findTeacher(teacherId:number){
    console.log("Got code: ", teacherId);
    let response = this.teacherService.findTeacherByTeacherCode(teacherId);
    response.subscribe((data:any) => {
      this.teacherData = data;
      console.log(this.teacherData);
      this.filterTeacher(this.teacherData.id);
      this.viewSubmittedLeaveRequest();
      this.findTimeTableByClass();
    });
  }

  certificates: CertificateDto[];
  public filterTeacher(teacherId: number){
    console.log("Got code: ", teacherId);
    let certificate: CertificateDto = new CertificateDto();
    certificate.teacherId = teacherId;
    console.log(certificate);
    let response = this.teacherService.getFilteredCertficate(certificate);
    response.subscribe((data:any) => {
      this.certificates = data["content"];
      console.log(this.certificates);
    });
  }

  closeResult: string;
  openLeaveApplicationModel(createContent:any){
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

  createApplicationRequest: FormGroup;
  initializeLeaveApplicationForm(){
    this.createApplicationRequest = new FormGroup({
      'appsubject': new FormControl(null, Validators.required),
      'appmessage': new FormControl(null, Validators.required)
    });
  }

  submitApplication(){
    let userData = JSON.parse(localStorage.getItem("UserData"));
    let dto: LeaveRequestDto = {
      submittedBy: this.teacherData.id.toString(),
      letterSubject: this.createApplicationRequest.value.appsubject,
      letterBody: this.createApplicationRequest.value.appmessage,
      roleName: userData.roles.name
    }
    let response = this.teacherService.submitLeaveApplication(dto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        this.teacherService.fireSwalToast(data.message);
        this.modalService.dismissAll();
        // this.viewSubmittedLeaveRequest();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  itemPerPage: number;
  leaveRequestList: LeaveRequestDto[] = [];
  viewSubmittedLeaveRequest(){
    let dto: LeaveRequestDto = {
      submittedBy: this.teacherData.id.toString(),
      pageNo: 0
    }
    let response = this.teacherService.viewStudentLeaveRequest(dto);
    response.subscribe((data:any) => {
      this.leaveRequestList = data["content"];
      this.pages = data["totalElements"]
      this.p = data["number"] + 1;
      this.itemPerPage = data["numberOfElements"];
    });
  }

  p: number = 0;
  pages: number = 0;
  pageChangeEvent(event) {
    this.p = event;
    console.log("Page: ", this.p);
    let studentData: LeaveRequestDto = {
      pageNo: event - 1,
      submittedBy: this.teacherData.id.toString()
    }
    let response = this.teacherService.viewStudentLeaveRequest(studentData);
    response.subscribe((data:any) => {
      this.leaveRequestList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      console.log(data);
    });
  }

  openViewLeaveApplicationModel(createContent:any, rowData: LeaveRequestDto){
    console.log("Row data: ", rowData);
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

  setRowDataInModal(rowData: LeaveRequestDto){
    this.viewApplicationRequest.patchValue({
      leaveid: rowData.id,
      appsubject: rowData.letterSubject,
      appmessage: rowData.letterBody
    });
  }

  viewApplicationRequest: FormGroup;
  initializeviewApplicationModal(){
    this.viewApplicationRequest = new FormGroup({
      'leaveid': new FormControl(null, Validators.required),
      'appsubject': new FormControl(null, Validators.required),
      'appmessage': new FormControl(null, Validators.required)
    });
  }
  timeTableReport: TimeTableReport = new TimeTableReport();
  findTimeTableByClass(){
    let dto: AssignSubjectsTeacherDto = {
      teacherId: this.teacherData.id
    }
    console.log("Selected dto: ", dto);
    let response = this.teacherService.viewTeacherTimeTable(dto);
    response.subscribe((data:any) => {
      this.timeTableReport = data;
      console.log("Time table report: ", this.timeTableReport);
    });
  }
}

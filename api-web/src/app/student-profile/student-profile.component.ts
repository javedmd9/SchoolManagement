import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Chart } from 'chart.js';
import { NgxCaptureService } from 'ngx-capture';
import { tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { AssignSubjectsTeacherDto, ExaminationDto, LeaveRequestDto, ReportCardDto, StudentDocumentDto, StudentDto, StudentGradeDto, StudentMarkDto, TeacherDto, TimeTableReport } from '../teachers/teacher.model';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css']
})
export class StudentProfileComponent implements OnInit {

  constructor(private routes: ActivatedRoute, private studentService: CampusService, private modalService: NgbModal,
    private captureService: NgxCaptureService) { }

  admissionNo: string;
  userRole: string;
  ngOnInit(): void {
    this.routes.queryParams.subscribe((params:any) => {
      this.admissionNo = params.admissionNo;
      console.log(this.admissionNo);
      this.findStudent(Number(this.admissionNo));
    });
    this.initializeLeaveApplicationForm();
    this.viewSubmittedLeaveRequest();
    this.initializeviewApplicationModal();
    let userData = JSON.parse(localStorage.getItem("UserData"));
    this.userRole = userData.roles.name;
    console.log("User Role: ", this.userRole);
  }

  studentData: StudentDto = new StudentDto();
  teacherData: TeacherDto = new TeacherDto();
  teacherName: string;
  public findStudent(studentId:number){
    console.log("Got code: ", studentId);
    let response = this.studentService.findStudentById(studentId);
    response.subscribe((data:any) => {
      this.studentData = data;
      let teacher = this.getClassTeacher(this.studentData);
      teacher.then((res:TeacherDto) => {this.teacherName = res.teacherName})
      this.studentAllDocuments(this.studentData);
      this.getStudentMarks();
      this.findAllExamByClass();
      this.findTimeTableByClass();
      this.findStudentGrade(this.studentData);
    });
  }

  documentData: any;
  async getClassTeacher(studentData: StudentDto) {
    let teacher: TeacherDto;
    let classTeacher: TeacherDto = {
      classId: studentData.classId,
      sectionId: studentData.sectionId,
    };
    let response = this.studentService.viewClassTeacher(classTeacher);
    response.subscribe((data:any) => {
      teacher = data;
    });
    let promise = new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve(teacher)
      }, 2000);
    });

    let promisedData = await promise.then(res => {return res});

    return promisedData;
    
  }

  studentAllDocuments(studentData: StudentDto){
    let documentsList: StudentDocumentDto;
    let response = this.studentService.viewAllStudentDocuments(studentData.admissionNo);
    response.subscribe((data:any) => {
      documentsList = data;
      this.documentData = JSON.parse(documentsList.documentData);
      console.log(this.documentData);
    });
    
  }

  examList: ExaminationDto[] = [];
  findAllExamByClass(){
    let response = this.studentService.findAllCurrentSessionExamByClass(this.studentData.classId);
    response.subscribe((data:any) => {
      this.examList = data;
    });
    
  }

  studentReportCard: ReportCardDto = new ReportCardDto();
  getStudentMarks(){
    // const examination = event.target.value;

    let studentMark: StudentMarkDto = {
      student: this.studentData,
      // examination: examination
    }
    
    let response = this.studentService.getIndividualMarks(studentMark);
    response.subscribe((data:any) => {
      this.studentReportCard = data;
      console.log("Student Mark list: ", this.studentReportCard);
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
      submittedBy: this.studentData.admissionNo,
      letterSubject: this.createApplicationRequest.value.appsubject,
      letterBody: this.createApplicationRequest.value.appmessage,
      roleName: userData.roles.name
    }
    let response = this.studentService.submitLeaveApplication(dto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        this.studentService.fireSwalToast(data.message);
        this.modalService.dismissAll();
        this.viewSubmittedLeaveRequest();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  itemPerPage: number;
  leaveRequestList: LeaveRequestDto[] = [];
  viewSubmittedLeaveRequest(){
    let dto: LeaveRequestDto = {
      submittedBy: this.admissionNo,
      pageNo: 0
    }
    let response = this.studentService.viewStudentLeaveRequest(dto);
    response.subscribe((data:any) => {
      this.leaveRequestList = data["content"];
      this.pages = data["totalElements"]
      this.p = data["number"] + 1;
      this.itemPerPage = data["numberOfElements"];
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

  setRowDataInModal(rowData: LeaveRequestDto){
    this.viewApplicationRequest.patchValue({
      leaveid: rowData.id,
      appsubject: rowData.letterSubject,
      appmessage: rowData.letterBody
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

  p: number = 0;
  pages: number = 0;
  pageChangeEvent(event) {
    this.p = event;
    console.log("Page: ", this.p);
    let studentData: LeaveRequestDto = {
      pageNo: event - 1,
      submittedBy: this.admissionNo
    }
    let response = this.studentService.viewStudentLeaveRequest(studentData);
    response.subscribe((data:any) => {
      this.leaveRequestList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      console.log(data);
    });
  }

  timeTableReport: TimeTableReport = new TimeTableReport();
  findTimeTableByClass(){
    let dto: AssignSubjectsTeacherDto = {
      classId: this.studentData.classId,
      sectionId: this.studentData.sectionId
    }
    console.log("Selected dto: ", dto);
    let response = this.studentService.viewClassTimeTable(dto);
    response.subscribe((data:any) => {
      this.timeTableReport = data;
      console.log("Time table report: ", this.timeTableReport);
    });
  }

  studentGrade: StudentGradeDto[] = [];
  findStudentGrade(student: StudentDto){
    let dto: StudentMarkDto = {
      admissionNo: student.admissionNo,
      classId: student.classId
    }
    let response = this.studentService.getStudentPercentAndGrade(dto);
    response.subscribe((data:any) => {
      this.studentGrade = data;
      console.log("Student grade: ",this.studentGrade);

      let examNameList: string[] = [];
      let examPercentage: number[] = [];
      this.studentGrade.forEach((ele:any) => examNameList.push(ele.examName));
      this.studentGrade.forEach((ele:any) => examPercentage.push(ele.percentage));
      this.implementStudentGradeChart(examNameList, examPercentage);
    });
  }

  implementStudentGradeChart(examLabel: string[], dataLabel: number[]) {
    new Chart("myChart", {
      type: 'bar',
      data: {
        labels: examLabel,
        datasets: [{
          data: dataLabel,
          minBarLength: 2,
          barThickness: 30,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(255, 159, 64, 0.2)',
            'rgba(255, 205, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(201, 203, 207, 0.2)'
          ],
          borderColor: [
            'rgb(255, 99, 132)',
            'rgb(255, 159, 64)',
            'rgb(255, 205, 86)',
            'rgb(75, 192, 192)',
            'rgb(54, 162, 235)',
            'rgb(153, 102, 255)',
            'rgb(201, 203, 207)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        legend: { display: false },
        tooltips: {
          bodySpacing: 4,
          mode: "nearest",
          intersect: false,
          position: "nearest",
          xPadding: 10,
          yPadding: 10,
          caretPadding: 10
        },
        title: {
          display: true,
          text: "Student Performance Chart"
        },
        scales: {
          yAxes: [{
              ticks: {
                  beginAtZero: true,
              }
          }]
      }
      }
    });
  }

  @ViewChild("screen", {static: true}) screen:any;

  img:any;

  capturePageImage(){
    this.captureService.getImage(this.screen.nativeElement, true).pipe(tap((img:any) => {
      this.img=img;
    })).subscribe();
  }

  openScreenShotPage(content:any){
    this.capturePageImage();
    this.modalService.open(content, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

}

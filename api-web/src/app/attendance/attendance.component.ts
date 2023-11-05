import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { AttendanceDto, AttendanceReport, StudentDto, TeacherDto, UserDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.component.html',
  styleUrls: ['./attendance.component.css']
})
export class AttendanceComponent implements OnInit {

  constructor(private service: CampusService, private modalService: NgbModal) { }

  attendanceSearchForm: FormGroup;
  userData: UserDto = new UserDto();
  userDataRole: string;
  teacherData: TeacherDto;
  showClassAndSection: boolean = false;
  takeAttendancePer: boolean = false;
  ngOnInit(): void {
    
    this.initializeSubmitAttendanceForm();
    const userData = JSON.parse(localStorage.getItem("UserData"));
    this.userDataRole = userData.roles.name;
    this.findUserDtoByRole(userData);
    this.initializeSearchAttendanceForm();
    if(userData.roles.name == "ADMIN" || userData.roles.name == "SUPER ADMIN"){
      this.showClassAndSection = true;
    }
    this.takeAttendancePer = this.service.permissionService(['TAKE ATTENDANCE']);
    
  }

  private findUserDtoByRole(userData: any) {
    let response = this.service.findUserByUsername(userData.username);
    response.subscribe((data: any) => {
      this.userData = data;
      if (userData.roles.name == "TEACHER") {
        this.getTeachersData(this.userData.teacherCode);
      } else {
        this.filterAttendance();
      }

    });
  }

  private initializeSearchAttendanceForm() {
    this.attendanceSearchForm = new FormGroup({
      'attendanceMonth': new FormControl(this.getCurrentMonthAndYear(), Validators.required),
      'sClassId': new FormControl(''),
      'sSectionId': new FormControl('')
    });
    // this.resetSearchFields();
  }

  private resetSearchFields() {
    this.attendanceSearchForm.patchValue({
      attendanceMonth: this.getCurrentMonthAndYear(),
      sClassId: "",
      sSectionId: ""
    });
    this.filterAttendance();
  }

  getTeachersData(code: number){
    let response = this.service.findTeacherByTeacherCode(code);
    response.subscribe((data:any) => {
      this.teacherData = data;
      console.log("Get teacher data: ", this.teacherData);
      this.viewStudentAttendance();
    });
  }

  closeResult: any;
  open(createAttendance: any){
    if(this.teacherData.classId != null){
      this.getStudentForAttendance(this.teacherData, 0);
      this.modalService.open(createAttendance, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg', centered: true, windowClass: 'my-class'
      }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
    
  }

  dismissModel() {
    this.modalService.dismissAll();
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

  submitAttendanceForm: FormGroup;
  studentTempData: any[] = [];
  pages: Array<number>;
  private getStudentForAttendance(teacher: TeacherDto, pgeNum:number) {
    this.studentTempData.splice(0, this.studentTempData.length);
    let studentFilter: StudentDto = {
      classId: teacher.classId,
      sectionId: teacher.sectionId,
      pageNumber: pgeNum
    };
    let response = this.service.getFilteredStudents(studentFilter);
    response.subscribe((data:any) => {
      this.studentDetails = data.content;
      this.pages = new Array(data["totalPages"]);
      console.log("Pages: ", this.pages);
      let studentTempData:any = {
        admissionNo: "",
        fullName: "",
        absentStatus: false,
        presentStatus: false,
        attendanceStatus: "",
        attendanceDate: null,
        holidayName: ""
      }
      for (let i = 0; i < this.studentDetails.length; i++) {
        // this.addNewField(this.studentDetails[i]);
        studentTempData = ({
          admissionNo: this.studentDetails[i].admissionNo,
          fullName: this.studentDetails[i].studentName,
          absentStatus: false,
          presentStatus: false,
          attendanceStatus: "",
          attendanceDate: this.submitAttendanceForm.value.attendanceDate,
          holidayName: this.submitAttendanceForm.value.holidayName
        });
        this.studentTempData.push(studentTempData);
      }
      this.showDateField = true;
    });
  }

  onAttendanceSave(){
    let attendanceDto: AttendanceDto[] = [];
    for (let i = 0; i < this.studentTempData.length; i++) {
      const element = this.studentTempData[i];
      let attendance: AttendanceDto = {
        attendanceDate: this.submitAttendanceForm.value.attendanceDate,
        status: element.attendanceStatus,
        admissionNo: element.admissionNo,
        holidayName: this.submitAttendanceForm.value.holidayName,
        teacherId: this.teacherData.id,
        classId: this.teacherData.classId,
        sectionId: this.teacherData.sectionId
      }
      attendanceDto.push(attendance);
    }
    // console.table(attendanceDto);
    let response = this.service.saveAttendance(attendanceDto);
    response.subscribe((data:any) => {
      if(data.result == "Success"){
        Swal.fire(data.result, "Attendance Saved.", 'success');
        // this.dismissModel();
      } else {
        Swal.fire(data.result, data.message, 'error');
      }
    });
  }

  attendanceReport: AttendanceReport = new AttendanceReport();
  viewStudentAttendance(){
    let newDate: Date = new Date();
    let attendanceDto: AttendanceDto = {
      attendanceDate: newDate,
      teacherId: this.teacherData.id? this.teacherData.id : null,
    }
    let response = this.service.viewStudentAttendance(attendanceDto);
    response.subscribe((data:any) => {
      this.attendanceReport = data;
    });
  }

  isHoliday: boolean = false;
  checkHoliday($event:any){
    if($event.target.value == 'Yes'){
      this.isHoliday = true;
    } else {
      this.isHoliday = false;
    }
  }
  bulkChecked($event:any){
    for (let i = 0; i < this.studentTempData.length; i++) {
      const element = this.studentTempData[i];
      this.onChangeStatus($event, element.admissionNo);
    }
  }

  onChangeStatus($event:any, registrationno?: string){
    const registrationNo = registrationno;
    let isCA: boolean, isCP: boolean;
    if($event.target.value == 'p'){
      isCP = true;
      isCA = false;
    } else {
      isCA = true;
      isCP = false;
    }
    
    // console.log(registrationNo, isCA, isCP);
    this.studentTempData = this.studentTempData.map((data) => {
      if(data.admissionNo === registrationNo){
        data.presentStatus = isCP;
        data.absentStatus = isCA;
        data.attendanceStatus = $event.target.value;
        return data;
      }
      return data;
    });
  }

  initializeSubmitAttendanceForm(){
    this.submitAttendanceForm = new FormGroup({
      'attendanceDate': new FormControl('', Validators.required),
      'holidayName': new FormControl('')
    });
    this.submitAttendanceForm.patchValue({
      attendanceDate: new Date().toISOString().split('T')[0],
      holidayName: null
    });
  }

  studentDetails: StudentDto[];
  showDateField: boolean = false;
  filterAttendance(){
    let getDate: string = this.attendanceSearchForm.value.attendanceMonth;
    var splitted = getDate.split("-");
    let newDate: Date = new Date(Number(splitted[0]), Number(splitted[1]), 0)
    let classId: string = this.attendanceSearchForm.value.sClassId == "" ? "1" : this.attendanceSearchForm.value.sClassId;
    
    let Teacher: number;
    if(this.userDataRole == "TEACHER"){
      Teacher = this.teacherData.id;
    }
    let attendanceDto: AttendanceDto = {
      attendanceDate: newDate,
      classId: classId,
      sectionId: this.attendanceSearchForm.value.sSectionId,
      teacherId: Teacher
    }
    let response = this.service.viewStudentAttendance(attendanceDto);
    response.subscribe((data:any) => {
      this.attendanceReport = data;
      console.log(this.attendanceReport);
    });
  }

  currMonth: string;
  currYear: number;
  getCurrentMonthAndYear() {
    let currentTime: Date = new Date();
    let currentMonth: number = currentTime.getUTCMonth() + 1;
    // var formattedMonth = ("0" + currentMonth).slice(-2);
    var formattedMonth = this.getDoubleDigitNumber(currentMonth);
    let currentYear: number = currentTime.getFullYear();

    this.currMonth = formattedMonth;
    this.currYear = currentYear;
    console.log("Current month: ", this.currMonth, " ", this.currYear)
    return this.currYear.toString()+"-"+this.currMonth.toString()
  }

  requestPage: number = 0;
  setPage(i, event) {
    event.preventDefault();
    if(i>0){
      this.requestPage = i;
    } else {
      this.requestPage = 0;
    }

    this.getStudentForAttendance(this.teacherData, this.requestPage);
  }

  getDoubleDigitNumber(num: number) {
    return num > 9 ? "" + num : "0" + num;
  }

  filterByMonth(event){
    const getMonth = event.target.value;
    console.log(getMonth);
  }

  classes: any[] = [{id: 1, name: "Class 1"}, {id: 2, name: "Class 2"}, {id: 3,name: "Class 3"}, {id: 4,name: "Class 4"},
  {id: 5, name: "Class 5"}, {id: 6, name: "Class 6"}, {id: 7,name: "Class 7"}, {id: 8,name: "Class 8"},
  {id: 9, name: "Class 9"}, {id: 10, name: "Class 10"}, {id: 11,name: "Class 11"}, {id: 12,name: "Class 12"}];
  
  sections: any[] = [{id: "A", name: "A"}, {id: "B", name: "B"}, {id: "C", name: "C"}]

}

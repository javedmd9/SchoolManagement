import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { AssignSubjectsTeacherDto, ExaminationDto, MarksDto, SchoolSession, StudentDto, StudentMarkDto, SubjectDto, TeacherDto, UserDto } from '../teachers/teacher.model';
import readXlsxFile from 'read-excel-file';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { map, pluck, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-student-marks',
  templateUrl: './student-marks.component.html',
  styleUrls: ['./student-marks.component.css']
})
export class StudentMarksComponent implements OnInit {

  constructor(private service: CampusService, private modalService: NgbModal, private fb: FormBuilder, private router: Router) { }

  userData: UserDto = new UserDto();
  teacherData: TeacherDto;
  
  ngOnInit(): void {
    const userData = JSON.parse(localStorage.getItem("UserData"));
    this.findUserDtoByRole(userData);
    this.initializeCreateStudentMarksForm();
    this.initializeFilterMarksModel();
    this.viewAllSavedMarks(userData);
    this.validationCheck(userData);
    this.filterStatus = false;
    this.dropdownsetting();
  }

  private findUserDtoByRole(userData: any) {
    let response = this.service.findUserByUsername(userData.username);
    response.subscribe((data: any) => {
      this.userData = data;
      console.log("UserDto: ", this.userData);
      if (!userData.roles.name.includes("ADMIN") && userData.roles.name != "STUDENT") {
        this.getTeachersData(this.userData.teacherCode);
      }

    });
  }

  getTeachersData(code: number){
    let response = this.service.findTeacherByTeacherCode(code);
    response.subscribe((data:any) => {
      this.teacherData = data;
      this.findLoggedInUsersClass(this.teacherData);
    });
  }

  forAdminLoginOnly: boolean = false;
  validationCheck(userData: any){
    if(userData.roles.name.includes("ADMIN")){
      this.forAdminLoginOnly = true;
    }
  }

  closeResult: string;
  open(createContent: any) {
    this.getAllSession();
    this.initializeCreateStudentMarksForm();
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

  sessionList: SchoolSession[];
  examinationList: ExaminationDto[];
  getAllSession(){
    let response = this.service.viewAllSession();
    response.subscribe((data:any) => {
      this.sessionList = data;
      console.log("Session List: ", this.sessionList);
    });
  }

  examId: number;
  setExamId(event:any){
    this.examId = Number(event.target.value);
  }

  sessionName: string;
  searchExamBySession(event:any){
    console.log("Session Name: ", event.target.value);
    this.sessionName = event.target.value;
    let response = this.service.getAllExamination(event.target.value);
    response.subscribe((data:any) => {
      this.examinationList = data;
      if(this.examinationList.length <=0){
        Swal.fire("Data not found");
      }
    });
  }

  assignClassList: AssignSubjectsTeacherDto[] = [];
  pages: Array<number>;
  uniqueSubjectArray: string[] = new Array();
  findLoggedInUsersClass(teacherData: TeacherDto){
    
    let assignDto: AssignSubjectsTeacherDto = {
      teacherId: teacherData.id
    }
    let response = this.service.getAssignSubjectCustomSearch(assignDto);
    response.subscribe((data:any) => {
      this.assignClassList = data;
      let subjectArray: string[] = new Array();
      this.assignClassList.forEach(ele => subjectArray.push(ele.subjectsDto.subjectCode));
      this.uniqueSubjectArray = Array.from(new Set(subjectArray));
      console.log("Assigned class and subjects: ", this.uniqueSubjectArray);
    });
  }

  studentDetail: StudentMarkDto[] = [];
  fullMarks: number;
  
  findAllStudent(classId: string, sectionId: string, subjectId: string, pageNum: number){
    const sessionName = document.getElementById("sessionname") as HTMLInputElement;
    const examName = document.getElementById("examname") as HTMLInputElement;
    let studentFilter: StudentMarkDto = {
      sessionName: sessionName.value,
      examName: examName.value,
      classId: classId,
      sectionId: sectionId,
      examSubject: subjectId,
      submittedById: this.teacherData.id,
      pageNum: pageNum
    };
    console.log("Data going to backend: ", studentFilter);
    let response = this.service.viewAllSavedMarksRecord(studentFilter);
    response.subscribe((data:any) => {
      this.studentDetail = data.content;
      this.pages = new Array(data["totalPages"]);
      this.marksarray.clear();
      this.fullMarks = this.studentDetail[0].examFullMarks;
      console.log("Student details: ", this.studentDetail);
      for (let i = 0; i < this.studentDetail.length; i++) {
        const element = this.studentDetail[i];
        let studentMarkLog: any = {
          id: element.id,
          admissionNo: element.student.admissionNo,
          studentName: element.student.studentName,
          attendanceStatus: element.attendanceStatus,
          fullMarks: element.examFullMarks,
          obtainedMarks: element.obtainedMarks
        }
        this.addNewField(studentMarkLog);
      }
    });
  }

  selectedSubject: string;
  findAllStudentMarks(event:any){
    const className = document.getElementById("classname") as HTMLInputElement;
    let classId: string = className.value;
    let subjectId = event.target.value;
    this.selectedSubject = subjectId;
    let splittedClass = classId.split(" ");
    this.findAllStudent(splittedClass[0], splittedClass[1], subjectId, 0);
    
  }

  requestPage: number = 0;
  setPage(i, event) {
    event.preventDefault();
    if(i>0){
      this.requestPage = i;
    } else {
      this.requestPage = 0;
    }
    const inputElement = document.getElementById("classname") as HTMLInputElement
    let classId: string = inputElement.value;
    let splittedClass = classId.split(" ");
    this.findAllStudent(splittedClass[0], splittedClass[1], this.selectedSubject, this.requestPage);
  }

  addStudentMarksForm: FormGroup;
  initializeCreateStudentMarksForm(){
    this.addStudentMarksForm = this.fb.group({
      studentMarksArray: this.fb.array([this.initializeStudentMarksArray(null)])
    });
  }

  initializeStudentMarksArray(item:any){
    if(!item){
      var item: any = {
        id: "",
        admissionNo: "",
        studentName: "",
        attendanceStatus: "",
        obtainedMarks: ""
      }
    }
    return this.fb.group({
      id: [item.id],
      admissionNo: [item.admissionNo],
      studentName: [item.studentName],
      attendanceStatus: [item.attendanceStatus, Validators.required],
      obtainedMarks: [item.obtainedMarks, Validators.required]
    });
  }

  get marksarray() {
    return this.addStudentMarksForm.get('studentMarksArray') as FormArray;
  }

  addNewField(item:any){
    this.marksarray.push(this.initializeStudentMarksArray(item));
  }

  attendancestatus(event:any){
    let arrayele = this.addStudentMarksForm.value.studentMarksArray;
    this.marksarray.clear();
    console.log("Array element: ", arrayele);
    for (let i = 0; i < arrayele.length; i++) {
      const element = arrayele[i];
      let changedMarkLog: any = {
        id: element.id,
        admissionNo: element.admissionNo,
        studentName: element.studentName,
        attendanceStatus: event.target.value,
        obtainedMarks: element.obtainedMarks
      }
      this.addNewField(changedMarkLog);
    }
    
  }

  checkMarks(index: number){
    let array = this.addStudentMarksForm.value.studentMarksArray;
    const getFullMarks = document.getElementById("examfullmarks") as HTMLInputElement
    let fullMarks: number = Number(getFullMarks.value);
    let enteredMarks: number = array[index].obtainedMarks;
    if(enteredMarks> fullMarks || enteredMarks < 0){
      Swal.fire("Warning", "Full Marks: " + fullMarks + " | " + "Entered Marks: " + enteredMarks, 'info');
    }
  }

  saveStudentMarks(){
    const sessionName = document.getElementById("sessionname") as HTMLInputElement;
    const examName = document.getElementById("examname") as HTMLInputElement;
    const className = document.getElementById("classname") as HTMLInputElement;
    const examFullMarks = document.getElementById("examfullmarks") as HTMLInputElement;
    const examSubject = document.getElementById("examsubject") as HTMLInputElement;
    let classId: string = className.value;
    let splittedClass = classId.split(" ");
    let array = this.addStudentMarksForm.value.studentMarksArray;
    let studentData: MarksDto = {
      sessionName: sessionName.value,
      examName: examName.value,
      classId: splittedClass[0],
      sectionId: splittedClass[1],
      examFullMarks: Number(examFullMarks.value),
      examSubject: examSubject.value,
      submittedById: this.teacherData.id,
      studentMarksData: JSON.stringify(this.addStudentMarksForm.value.studentMarksArray)
    }
    console.log("Marks Dto : ", studentData);
    let response = this.service.addStudentMarks(studentData);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.modalService.dismissAll();
        let markDto: StudentMarkDto = {
          submittedById: this.teacherData.id
        }
        this.viewAllRelatedMarks(markDto);
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  filterStudentMarksForm: FormGroup;
  initializeFilterMarksModel(){
    this.filterStudentMarksForm = new FormGroup({
      'fsessionname': new FormControl(""),
      'fexamname': new FormControl(""),
      'fclassname': new FormControl(""),
      'fteachername': new FormControl(""),
      'fstudentname': new FormControl(""),
      'fsubjectname': new FormControl("")
    });
  }

  openFilterModel(createContent: any) {
    const userData = JSON.parse(localStorage.getItem("UserData"));
    console.log("Const user data: ", userData);
    this.getAllSession();
    // this.initializeFilterMarksModel();
    if(!userData.roles.name.includes("TEACHER")){
      this.getAllDistinctClasses();
    } else {
      console.log("this.userData.userType.includes: ", userData.roles.name.includes("TEACHER"));
      this.findLoggedInUsersClass(this.teacherData);
    }
    this.viewAllTeachers();
    this.viewAllSubjects();
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getAllDistinctClasses(){
    let response = this.service.viewAllDistinctClasses();
    response.subscribe((data:any) => {
      this.assignClassList = data;
      console.log(this.assignClassList);
    })
  }

  teachersList: TeacherDto[];
  viewAllTeachers(){
    let response = this.service.findTeacherByRoles();
    response.subscribe((data:any) => {
      this.teachersList = data;
    });
  }

  subjectList: SubjectDto[];
  viewAllSubjects(){
    let loggedInUserRole = JSON.parse(localStorage.getItem("UserData"))
    if(loggedInUserRole.roles.name.includes("ADMIN")){
      let response = this.service.viewAllSubjects();
    response.subscribe((data:any) => {
      this.subjectList = data;
      from(this.subjectList).pipe(map((ele:any) => ele.subjectCode),toArray()).subscribe((res:any) => this.uniqueSubjectArray = res);
    });
    } else {
      this.uniqueSubjectArray;
    }
    
  }

  requestedPage: number = 0;
  filterStatus: boolean = false;
  submitFilterRequest(){
    this.markTeacherLogin = false;
    let pageRequest: number;
    console.log("Requested Page in filter: ", this.requestPage);
    if(this.requestPage != 0){
      pageRequest = this.requestPage;
    } else {
      pageRequest = 0;
    }
    let strClass = this.filterStudentMarksForm.value.fclassname;
    let splittedClass = strClass.split(" ");
    let marksFilter: StudentMarkDto = {
      sessionName: this.filterStudentMarksForm.value.fsessionname,
      examName: this.filterStudentMarksForm.value.fexamname,
      examSubject: this.filterStudentMarksForm.value.fsubjectname,
      submittedById: this.filterStudentMarksForm.value.fteachername,
      classId: splittedClass[0],
      sectionId: splittedClass[1],
      studentName: this.filterStudentMarksForm.value.fstudentname,
      pageNum: pageRequest
    }
    console.table(marksFilter);
    this.viewAllRelatedMarks(marksFilter);
    this.modalService.dismissAll();
    this.filterStatus = true;
  }

  filteredMarks: StudentMarkDto[];
  markTeacherLogin: boolean = false;
  viewAllSavedMarks(userData:any){
    let marksDto: StudentMarkDto = new StudentMarkDto();
    if(userData.roles.name.includes("TEACHER")){
      this.markTeacherLogin = true;
      let pageRequest: number;
      console.log("Requested Page by teacher: ", this.requestedPage);
      if(this.requestedPage != 0){
        pageRequest = this.requestedPage;
      } else {
        pageRequest = 0;
      }
      let usersData2 = this.getUserByRoles();
      usersData2.then((res:UserDto) => {
        let dto: StudentMarkDto = {
          submittedById: this.userData.userId,
          pageNum: pageRequest
        }
        this.viewAllRelatedMarks(dto);
      });
      
    } else {
      console.log("Calling Admin section marks");
      this.viewAllRelatedMarks(marksDto);
    }
  }

  bulkFilteredData: StudentMarkDto[] = [];
  private viewAllRelatedMarks(marksDto: StudentMarkDto) {
    console.log("Filter request: ", marksDto);
    let response = this.service.viewAllSavedMarksRecord(marksDto);
    response.subscribe((data: any) => {
      this.filteredMarks = data["content"];
      this.pages2 = data["totalElements"];
      this.p = data["number"] +1;
      console.log("Filtered Data: ",data);
    });
    let response2 = this.service.getAllFilteredBulkStudentMarks(marksDto);
    response2.subscribe((data:any) => {
      this.bulkFilteredData = data;
    });
  }

  async getUserByRoles(){
    const userData = JSON.parse(localStorage.getItem("UserData"));
    let response = await this.service.findUserByUsername(userData.username).toPromise();
    return response;
  }

  pages2: number;
  p: number = 0;
  itemPerPage: number;

  pageChangeEvent(event) {
    this.p = event;
    if (this.filterStatus) {
      this.requestPage = event -1;
      this.markTeacherLogin = false;
      this.requestedPage = 0;
      this.submitFilterRequest();
    } else if(this.markTeacherLogin){
      this.requestedPage = event -1
      let user = JSON.parse(localStorage.getItem("UserData"));
      this.viewAllSavedMarks(user);
    } else {
      console.log("Page: ", this.p);
      let markData: StudentMarkDto = {
        pageNum: event - 1
      }
      this.viewAllRelatedMarks(markData);
    }
  }

  fileName = 'StudentlisMarks.xlsx';
  exportDataToExcel(){

    let teacherId = null;
    if(this.teacherData != null){
      teacherId = this.teacherData.id;
    } else {
      teacherId = this.filterStudentMarksForm.value.fteachername;
    }

    if(teacherId == null || teacherId == ""){
      Swal.fire("Warning", "Please select subject teacher", 'info');
      return;
    }
    
    let excelArray: any[] = [];
    for (let i = 0; i < this.bulkFilteredData.length; i++) {
      const element = this.bulkFilteredData[i];
      let excelData:any = {
        id: element.id,
        SessionName: element.sessionName,
        ExaminationId: element.examination.id,
        AdmissionNo: element.student.admissionNo,
        Name: element.student.studentName,
        SubmittedById: teacherId,
        ClassId: element.classId,
        SectionId: element.sectionId,
        SubjectId: element.subjects.id,
        SubjectCode: element.subjects.subjectCode,
        ObtainedMarks: element.obtainedMarks,
        FullMarks: element.examFullMarks,
        Present: "P"
      }
      excelArray.push(excelData);
    }
    
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelArray);
    console.log("Json data: ", excelArray);

    /* generate workbook and add the worksheet */
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // delete (ws['H1'])
    //console.log(wb);
    /* save to file */
    XLSX.writeFile(wb, this.fileName);
  }

  showBulkUploadModal(openBulkModal:any){
    this.modalService.open(openBulkModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  studentBulkMark: MarksDto;
  uploadBulkData(uploadBulkData:any){
    let fileReaded: any;
    fileReaded = uploadBulkData.target.files[0];
    let type = uploadBulkData.target.files[0].name.split('.').pop();
    const schema = {
      'id': {
        prop: 'id',
        type: Number,
        required: true
      },
      'SessionName': {
        prop: 'sessionName',
        type: String,
        required: true
      },
      'ExaminationId': {
        prop: 'examName',
        type: Number,
        required: true
      },
      'AdmissionNo': {
        prop: 'admissionNo',
        type: String,
        required: true
      },
      'Name': {
        prop: 'studentName',
        type: String,
        required: true
      },
      'SubmittedById': {
        prop: 'submittedById',
        type: Number,
        required: true
      },
      'ClassId': {
        prop: 'classId',
        type: Number,
        required: true
      },
      'SectionId': {
        prop: 'sectionId',
        type: String,
        required: true
      },
      'SubjectId': {
        prop: 'examSubject',
        type: Number,
        required: true
      },
      'FullMarks': {
        prop: 'examFullMarks',
        type: Number,
        required: true
      },
      'ObtainedMarks': {
        prop: 'obtainedMarks',
        type: Number,
        required: true
      },
      'Present': {
        prop: 'attendanceStatus',
        type: String,
        required: true
      }
    }
    readXlsxFile(fileReaded, {schema}).then((data:any) => {
      let markData: any[] = [];
      let examinationId: string;
      if(data.rows){
        console.log("Data log: ", data.rows);
        for (let i = 0; i < data.rows.length; i++) {
          const element = data.rows[i];
          let markEntry: any = {
            id: element.id,
            admissionNo: element.admissionNo,
            studentName: element.studentName,
            attendanceStatus: element.attendanceStatus,
            obtainedMarks: element.obtainedMarks
          }
          markData.push(markEntry);
        }
        let studentData: MarksDto = {
          sessionName: data.rows[0].sessionName,
          examName: data.rows[0].examName,
          classId: data.rows[0].classId,
          sectionId: data.rows[0].sectionId,
          examFullMarks: data.rows[0].examFullMarks,
          examSubject: data.rows[0].examSubject,
          submittedById: data.rows[0].submittedById,
          studentMarksData: JSON.stringify(markData)
        }
        this.studentBulkMark = studentData;
        console.log("Mark Data: ",this.studentBulkMark);
      }
    });
  }

  onBulkSubmit(){
    let response = this.service.addStudentMarks(this.studentBulkMark);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.modalService.dismissAll();
        let markDto: StudentMarkDto = {
          submittedById: this.teacherData.id
        }
        this.viewAllRelatedMarks(markDto);
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  public viewStudent(code: number){
    let url = this.router.serializeUrl(this.router.createUrlTree(['/student-profile'], { queryParams: { admissionNo: code} }));
    window.open(url, '_blank');
    // this.router.navigate(['/student-profile'], { queryParams: { admissionNo: code} });
  }

  dropdownSettings: any;
  dropdownsetting(){
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'studentName',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 4,
      allowSearchFilter: true
    };
  }

  onItemSelect(item: any){
    console.log("Selected id: ", item);
  }

  studentSearch: string[];
  autoSearchStudentName(){
    console.log("Typed result: ", this.filterStudentMarksForm.value.fstudentname);
    let response = this.service.autoSearchStudentName(this.filterStudentMarksForm.value.fstudentname);
    response.subscribe((data:any) => {
      from(data).pipe(pluck('studentName'),toArray()).subscribe((res:any) => {
        this.studentSearch = res;
        console.log("Student Name: ", this.studentSearch);
      });
    });
    
  }

}

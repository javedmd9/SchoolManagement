import { Component, HostListener, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Jsonp } from '@angular/http';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { SchoolSession, ExaminationDto, UserDto, TeacherDto, AssignSubjectsTeacherDto, OtherMarksDto, TempOtherMarkDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-other-mark',
  templateUrl: './other-mark.component.html',
  styleUrls: ['./other-mark.component.css']
})
export class OtherMarkComponent implements OnInit {

  constructor(private service: CampusService, private fb: FormBuilder, private modalService: NgbModal) { }

  userData: UserDto = new UserDto();
  teacherData: TeacherDto;
  ngOnInit(): void {
    this.getAllSession();
    let userData = JSON.parse(localStorage.getItem("UserData"));
    this.findUserDtoByRole(userData);
    this.initializeCreateStudentMarksForm();
    this.initializeStudentMarksArray(null);
    this.viewAllOtherMarksOfStudent();
    this.initializeFilterDatesheetForm();
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

  sessionList: SchoolSession[];
  examinationList: ExaminationDto[];
  getAllSession(){
    let response = this.service.viewAllSession();
    response.subscribe((data:any) => {
      this.sessionList = data;
      console.log("Session List: ", this.sessionList);
    });
  }

  get dclassname() { return this.filterExamDateSheetForm.get('dclassname') }
  get dsessionname() { return this.filterExamDateSheetForm.get('dsessionname') }

  filterExamDateSheetForm: FormGroup;
  initializeFilterDatesheetForm(){
    this.filterExamDateSheetForm = new FormGroup({
      'dsessionname': new FormControl("", Validators.required),
      'dclassname': new FormControl("", Validators.required),
    });
  }


  searchExamBySession(sessionName?: string, className?: string){
    console.log("Session Name: ", this.filterExamDateSheetForm.value.dsessionname);
    let dto: ExaminationDto = {
      sessionName: sessionName,
      classId: className.split(" ")[0]
    }
    let response = this.service.getAllExamination(dto);
    response.subscribe((data:any) => {
      let examList: ExaminationDto[] = data;
      this.examinationList = examList.filter((ele:ExaminationDto) => ele.examType.toUpperCase() == "MINOR");
    });
  }

  selectedExam: ExaminationDto[] = [];
  getExamList(e: any | null, item: ExaminationDto) {

    if (e.target.checked) {
      this.selectedExam.push(item);
      console.log("Selected Items: ", this.selectedExam);
    } else {
      this.selectedExam = this.selectedExam.filter(del => del.id != item.id);
      console.log("Selected Items: ", this.selectedExam);
    }
  }

  otherMarkDto: OtherMarksDto[] = [];
  viewStudentMarks(){
    let examIdList: number[] = [];
    for (let i = 0; i < this.selectedExam.length; i++) {
      const element = this.selectedExam[i];
      examIdList.push(element.id);
    }
    let sessionName = document.getElementById("sessionname") as HTMLInputElement;
    const subjectId = document.getElementById("examsubject") as HTMLInputElement;
    const className = document.getElementById("classId") as HTMLInputElement;
    let classID = className.value;
    let splittedClass = classID.split(" ");
    let dto: OtherMarksDto = {
      sessionName: sessionName.value,
      subjectCode: subjectId.value,
      classId: splittedClass[0],
      sectionId: splittedClass[1],
      submittedById: this.teacherData.id,
      examId: examIdList
    }
    console.log("DTO Data: ",dto);
    let response = this.service.findOtherMarksStudentList(dto);
    response.subscribe((data:any) => {
      this.otherMarkDto = data;
      this.marksarray.clear();
      for (let i = 0; i < this.otherMarkDto.length; i++) {
        const element = this.otherMarkDto[i];
        let studentMark: any = {
          admissionno: element.studentDto.admissionNo,
          studentname: element.studentDto.studentName,
          ptMarks: element.ptMarks,
          subEnrich: element.subEnrich,
          notebook: element.notebook
        }
        this.addNewField(studentMark);
      }
      
      console.log(this.otherMarkDto);
    });
  }

  addOtherMarksForm: FormGroup;
  initializeCreateStudentMarksForm(){
    this.addOtherMarksForm = this.fb.group({
      studentMarksArray: this.fb.array([this.initializeStudentMarksArray(null)])
    });
  }
  initializeStudentMarksArray(item:any){
    if(!item){
      var item: any = {
        admissionNo: "",
        studentName: "",
        ptMarks: "",
        subEnrich: "",
        notebook: ""
      }
    }
    return this.fb.group({
      admissionNo: [item.admissionno],
      studentName: [item.studentname],
      ptMarks: [item.ptMarks, Validators.required],
      subEnrich: [item.subEnrich, Validators.required],
      notebook: [item.notebook, Validators.required]
    });
  }

  get marksarray() {
    return this.addOtherMarksForm.get('studentMarksArray') as FormArray;
  }

  addNewField(item:any){
    this.marksarray.push(this.initializeStudentMarksArray(item));
  }

  closeResult: string;
  showStudentUploadModal(openUploadModal:any){
    this.modalService.open(openUploadModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'xl'
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  private getDismissReason(reason: any): string {
    console.log("Reason: ", reason);
    if (reason == ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  majorExamList: ExaminationDto[];
  openSubmitModal(openContent:any){
    // this.swalFireInput1();
    const classSection = document.getElementById("classId") as HTMLInputElement
    let splittedClass = classSection.value.split(" ");
    let dto: ExaminationDto = {
      classId: splittedClass[0],
      examType: 'Major'
    }
    let response = this.service.customFilterExamination(dto);
    response.subscribe((data:any) => {
      console.log("Exam list: ", data);
      this.majorExamList = data;
    });
    this.modalService.open(openContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'md'
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  saveStudentMarks(){
    const examId = document.getElementById("majorexamname") as HTMLInputElement;
    const examSubject = document.getElementById("examsubject") as HTMLInputElement;
    if(this.addOtherMarksForm.valid){
      let dto: TempOtherMarkDto = {
        examinationId: Number(examId.value),
        subjectCode: examSubject.value,
        studentData: JSON.stringify(this.addOtherMarksForm.value.studentMarksArray)
      }
      let response = this.service.saveStudentOtherMarks(dto);
      response.subscribe((data:any) => {
        if(data.result.toUpperCase() == "SUCCESS"){
          this.fireSwalToast(data.message, 'success');
          this.modalService.dismissAll();
        } else {
          Swal.fire(data.result, data.message, 'info');
        }
      });
    } else {
      this.fireSwalToast('Please fill important fields', 'info')
    }
    
  }

  private fireSwalToast(msg: any, iconName: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-left',
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast'
      },
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
    Toast.fire({
      icon: iconName,
      title: msg
    });
  }

  subEnrichApply(event:any){
    let arrayele = this.addOtherMarksForm.value.studentMarksArray;
    this.marksarray.clear();
    console.log("Array element: ", arrayele);
    for (let i = 0; i < arrayele.length; i++) {
      const element = arrayele[i];
      let studentMark: any = {
        admissionno: element.admissionNo,
        studentname: element.studentName,
        ptMarks: element.ptMarks,
        subEnrich: event.target.value,
        notebook: element.notebook
      }
      this.addNewField(studentMark);
    }
    
  }
  notebookMarksApply(event:any){
    let arrayele = this.addOtherMarksForm.value.studentMarksArray;
    this.marksarray.clear();
    console.log("Array element: ", arrayele);
    for (let i = 0; i < arrayele.length; i++) {
      const element = arrayele[i];
      let studentMark: any = {
        admissionno: element.admissionNo,
        studentname: element.studentName,
        ptMarks: element.ptMarks,
        subEnrich: element.subEnrich,
        notebook: event.target.value
      }
      this.addNewField(studentMark);
    }
    
  }


  viewAllOtherMarksOfStudent(){
    let response = this.service.viewAllStudentsOtherMarks();
    response.subscribe((data:any) => {
      this.otherMarkDto = data;
      console.log("Student other Marks: ", this.otherMarkDto);
    });
  }


  private swalFireInput1() {
    Swal.fire({
      title: 'Select field validation',
      input: 'select',
      inputOptions: {
        '01': 'Item 1',
        '02': 'Item 2',
        '03': 'Item 3',
        '04': 'Item 4',
      },
      inputPlaceholder: 'Select',
      showCancelButton: true,
      inputValidator: (value) => {
        return new Promise((resolve) => {
          if (value === '01') {
            Swal.fire("success", "", 'success');
          } else {
            resolve('You need to select Item 1: ');
          }
        });
      }
    });
  }
}

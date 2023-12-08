import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { data } from 'jquery';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { AssignSubjectsTeacherDto, SchoolSession, SubjectDto, TeacherDto } from '../teachers/teacher.model';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-assign-subject',
  templateUrl: './assign-subject.component.html',
  styleUrls: ['./assign-subject.component.css']
})
export class AssignSubjectComponent implements OnInit {

  constructor(private service: CampusService, private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.initializeCreateForm();
    this.viewAllSubjects();
    this.viewAllTeachers();
    this.getAllAssignedSubject();
    this.getAllSession();
  }

  assignClassSubjectForm: FormGroup;
  initializeCreateForm(){
    this.assignClassSubjectForm = new FormGroup({
      'subjectname': new FormControl('', Validators.required),
      'subjectclass': new FormControl('', Validators.required),
      'subjectsection': new FormControl('', Validators.required),
      'subjectteacher': new FormControl('', Validators.required),
    });
    this.setDefaultValue();
  }

  filterSubjectTeacherForm: FormGroup;
  initializeFilterSubjectTeacherForm(){
    this.filterSubjectTeacherForm = new FormGroup({
      'fsessionname': new FormControl('', Validators.required),
      'fclassname': new FormControl('', Validators.required),
      'fsubject': new FormControl('', Validators.required),
      'fteacher': new FormControl('', Validators.required),
    });
    this.filterSubjectTeacherForm.patchValue({
      fsesssion: "",
      fclassname: "",
      fsubject: "",
      fteacher: ""
    });
    this.getAllDistinctClasses();
  }

  setDefaultValue(){
    this.assignClassSubjectForm.patchValue({
      subjectname: "",
      subjectclass: null,
      subjectsection: null,
      subjectteacher: ""
    });
  }

  subjectList: SubjectDto[];
  viewAllSubjects(){
    let response = this.service.viewAllSubjects();
    response.subscribe((data:any) => {
      this.subjectList = data;
    });
  }

  teachersList: TeacherDto[];
  viewAllTeachers(){
    let response = this.service.findTeacherByRoles();
    response.subscribe((data:any) => {
      this.teachersList = data;
    });
  }

  onSubmit(){
    let assignSubjectDto: AssignSubjectsTeacherDto = {
      subjectId: this.assignClassSubjectForm.value.subjectname,
      teacherId: this.assignClassSubjectForm.value.subjectteacher,
      classId: this.assignClassSubjectForm.value.subjectclass,
      sectionId: this.assignClassSubjectForm.value.subjectsection
    }
    let response = this.service.assignSubjectTeacher(assignSubjectDto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.getAllAssignedSubject();
        this.setDefaultValue();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  assignedSubjectList: AssignSubjectsTeacherDto[];
  getAllAssignedSubject(){
    this.initializeFilterSubjectTeacherForm();
    this.p = 1;
    let dto: AssignSubjectsTeacherDto = {
      sessionName: this.filterSubjectTeacherForm?.value?.fsessionname,
      classId: null,
      sectionId: null,
      subjectId: null,
      teacherId: null,
      pageNumber: this.p
    }
    let response = this.service.getAssignSubjectCustomSearch(dto);
    response.subscribe((data:any) => {
      this.assignedSubjectList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      this.itemPerPage = data["numberOfElements"];
      console.log(data);
      console.log(this.assignedSubjectList);
    });
  }

  deleteAssignedSubject(assignedSubject: AssignSubjectsTeacherDto){
    let response = this.service.deleteAssignedSubjectRecord(assignedSubject);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.getAllAssignedSubject();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  public viewTeacher(code: number){
    let url = this.router.serializeUrl(this.router.createUrlTree(['/user-profile'], { queryParams: { teacherCode: code} }));
    window.open(url, '_blank');
  }

  pages: number;
  p: number = 1;
  itemPerPage: number;
  pageChangeEvent(event) {
    this.p = event;
    console.log("Page: ", this.p);
    let classSection = this.filterSubjectTeacherForm?.value?.fclassname;
    let classId = classSection?.split(" ")[0];
    let sectionId = classSection?.split(" ")[1];
    let dto: AssignSubjectsTeacherDto = {
      sessionName: this.filterSubjectTeacherForm?.value?.fsessionname,
      classId: classId,
      sectionId: sectionId,
      subjectId: this.filterSubjectTeacherForm?.value?.fsubject,
      teacherId: this.filterSubjectTeacherForm?.value?.fteacher,
      pageNumber: this.p
    }
    let response = this.service.getAssignSubjectCustomSearch(dto);
    response.subscribe((data:any) => {
      this.assignedSubjectList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      console.log(data);
    });
  }

  classList: AssignSubjectsTeacherDto[] = [];
  getAllDistinctClasses(){
    let response = this.service.viewAllDistinctClasses();
    response.subscribe((data:any) => {
      this.classList = data;
      console.table(this.classList);
    })
  }

  sessionList: SchoolSession[];
  getAllSession(){
    let response = this.service.viewAllSession();
    response.subscribe((data:any) => {
      this.sessionList = data;
      console.log("Session List: ", this.sessionList);
    });
  }

  closeResult: string;
  openModel(createContenet: any) {

    let modalName = createContenet._declarationTContainer.localNames[0];
    console.log("Modal name: ", modalName);
    if(modalName == ModalList.Filter_Modal){
      this.initializeFilterSubjectTeacherForm();
    }
   
    this.modalService.open(createContenet, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true, animation: true
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

  customSubjectList: AssignSubjectsTeacherDto[] = [];
  displayAllSubject(event:any){
    let classId = event.target.value.split(" ")[0];
    let response = this.service.getSubjectListByClass(classId);
    response.subscribe((data:any) => {
      this.customSubjectList = data;
      console.log("Custom subject list: ", this.customSubjectList);
    });
  }

  getFilteredSubjectTeacher(){
    let classSection = this.filterSubjectTeacherForm.value.fclassname;
    let classId = classSection.split(" ")[0];
    let sectionId = classSection.split(" ")[1];
    let dto: AssignSubjectsTeacherDto = {
      sessionName: this.filterSubjectTeacherForm.value.fsessionname,
      classId: classId,
      sectionId: sectionId,
      subjectId: this.filterSubjectTeacherForm.value.fsubject,
      teacherId: this.filterSubjectTeacherForm.value.fteacher,
      pageNumber: 0
    }

    let response = this.service.getAssignSubjectCustomSearch(dto);
    response.subscribe((data:any) => {
      this.assignedSubjectList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      this.itemPerPage = data["numberOfElements"];
      console.log(data);
      console.log(this.assignedSubjectList);
      this.modalService.dismissAll();
    });
  }

}

enum ModalList {
  Filter_Modal = 'filterModal',
  // Other enum values...
}

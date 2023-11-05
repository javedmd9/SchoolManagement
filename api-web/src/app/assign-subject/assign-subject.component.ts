import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { data } from 'jquery';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { AssignSubjectsTeacherDto, SubjectDto, TeacherDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-assign-subject',
  templateUrl: './assign-subject.component.html',
  styleUrls: ['./assign-subject.component.css']
})
export class AssignSubjectComponent implements OnInit {

  constructor(private service: CampusService, private router: Router) { }

  ngOnInit(): void {
    this.initializeCreateForm();
    this.viewAllSubjects();
    this.viewAllTeachers();
    this.getAllAssignedSubject();
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
    let response = this.service.viewAllAssignedSubjectTeacher(0);
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
  p: number = 0;
  itemPerPage: number;
  pageChangeEvent(event) {
    this.p = event;
    console.log("Page: ", this.p);
    let response = this.service.viewAllAssignedSubjectTeacher(Number(event -1));
    response.subscribe((data:any) => {
      this.assignedSubjectList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      console.log(data);
    });
  }

}

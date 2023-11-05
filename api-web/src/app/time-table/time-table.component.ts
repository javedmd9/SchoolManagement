import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { AssignSubjectsTeacherDto, TeacherDto, TimeTableReport } from '../teachers/teacher.model';

@Component({
  selector: 'app-time-table',
  templateUrl: './time-table.component.html',
  styleUrls: ['./time-table.component.css']
})
export class TimeTableComponent implements OnInit {

  constructor(private service: CampusService, private fb: FormBuilder, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.initializeAssignTimeTableForm();
    this.initializeFilterDatesheetForm();
    this.initializeFilterClassTimeTable();
    this.getAllDistinctClasses();
    this.initializeOptionalSubjectClassTimeTable();
  }

  createTimeTable: boolean;
  validateTimeTablePermission(){
    this.createTimeTable = this.service.permissionService(['CREATE TIME TABLE']);
  }

  filterTimeTableForm: FormGroup;
  createClassTimeTableForm: FormGroup;
  filterClassSubjectForm: FormGroup;
  createOptionalSubjectClassTimeTableForm: FormGroup;
  initializeFilterDatesheetForm(){
    this.filterClassSubjectForm = new FormGroup({
      'dsessionname': new FormControl("", Validators.required),
      'dclassname': new FormControl("", Validators.required),
    });
  }

  initializeFilterClassTimeTable(){
    this.filterTimeTableForm = new FormGroup({
      'fclassname': new FormControl("", Validators.required)
    });
  }

  initializeOptionalSubjectClassTimeTable(){
    this.createOptionalSubjectClassTimeTableForm = new FormGroup({
      'sessionname': new FormControl("", Validators.required),
      'classname': new FormControl("", Validators.required),
      'subjectname': new FormControl("", Validators.required),
      'teachername': new FormControl("", Validators.required),
      'daysname': new FormControl("", Validators.required),
      'periodno': new FormControl("", Validators.required),
    });
  }

  initializeAssignTimeTableForm(){
    this.createClassTimeTableForm = this.fb.group({
      subjectarrayform: this.fb.array([this.initializeSubjectArray(null)])
    });
  }

  initializeSubjectArray(item:any) {
    if(!item){
      var item:any = {
        assignId: [{ value: "", disabled: true }],
        teachername: [{ value: "", disabled: true }],
        subjectname: [{ value: "", disabled: true }],
        classID: [{ value: "", disabled: true }],
        sectionId: [{ value: "", disabled: true }],
        monday: "",
        tuesday: "",
        wednesday: "",
        thursday: "",
        friday: "",
        saturday: ""
      }
    }
    return this.fb.group({
      assignId: [item.assignId],
      teachername: [item.teachername],
      subjectname: [item.subjectname],
      classID: [item.classID],
      sectionId: [item.sectionId],
      monday: [item.monday, Validators.required],
      tuesday: [item.tuesday, Validators.required],
      wednesday: [item.wednesday, Validators.required],
      thursday: [item.thursday, Validators.required],
      friday: [item.friday, Validators.required],
      saturday: [item.saturday, Validators.required]
    });
  }

  addNewField(item:any){
    this.subjectarray.push(this.initializeSubjectArray(item));
  }

  get subjectarray() {
    return this.createClassTimeTableForm.get('subjectarrayform') as FormArray;
  }

  assignedSubjects: AssignSubjectsTeacherDto[] = [];
  viewClassSubject(){
    let dto: AssignSubjectsTeacherDto = {
      sessionName: this.filterClassSubjectForm.value.dsessionname,
      classId: this.filterClassSubjectForm.value.dclassname
    }
    let response = this.service.getAssignSubjectCustomSearch(dto);
    response.subscribe((data:any) => {
      this.assignedSubjects = data;
      console.log(this.assignedSubjects);
      this.subjectarray.clear();
      for (let i = 0; i < this.assignedSubjects.length; i++) {
        const element = this.assignedSubjects[i];
        let timeTable: any = {
          assignId: element.id,
          teachername: element.teacherDto.teacherName,
          subjectname: element.subjectsDto.subjectName,
          classID: element.classId,
          sectionId: element.sectionId,
          monday: "",
          tuesday: "",
          wednesday: "",
          thursday: "",
          friday: "",
          saturday: ""
        }
        this.addNewField(timeTable);
      }
    });
  }

  closeResult: string;
  openAssignTimeTableModel(createContent:any){
    this.getAllSession();
    this.getClassList();
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openAssignTimeTableModel2(createContent:any){
    this.getAllSession();
    this.getAllDistinctClasses();
    this.viewAllTeachers();
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

  classList: string[] = [];
  sessionList: string[] = [];
  getAllSession(){
    let response = this.service.viewAllDistinctSession();
    response.subscribe((data:any) => {
      this.sessionList = data;
    });
  }

  getClassList(){
    let response = this.service.getClassListFromAssignedSubject();
    response.subscribe((data:any) => {
      this.classList = data;
    });
  }

  saveTimeTable(){
    let response = this.service.saveTimeTable(JSON.stringify(this.createClassTimeTableForm.value.subjectarrayform));
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        this.service.fireSwalToast(data.message);
        this.modalService.dismissAll();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  assignClassList: AssignSubjectsTeacherDto[] = [];
  getAllDistinctClasses(){
    let response = this.service.viewAllDistinctClasses();
    response.subscribe((data:any) => {
      this.assignClassList = data;
      console.log("Distinct class: ",this.assignClassList);
    })
  }

  timeTableReport: TimeTableReport = new TimeTableReport();
  findTimeTableByClass(event:any){
    const className = event.target.value;
    let splittedClass = className.split(" ");
    let dto: AssignSubjectsTeacherDto = {
      classId: splittedClass[0],
      sectionId: splittedClass[1]
    }
    console.log("Selected dto: ", dto);
    let response = this.service.viewClassTimeTable(dto);
    response.subscribe((data:any) => {
      this.timeTableReport = data;
      console.log("Time table report: ", this.timeTableReport);
    });
  }

  viewClassSubjectList(){
    const classname = this.createOptionalSubjectClassTimeTableForm.value.classname;
    let splittedClass = classname.split(" ");
    let dto: AssignSubjectsTeacherDto = {
      sessionName: this.createOptionalSubjectClassTimeTableForm.value.sessionname,
      classId: splittedClass[0],
      sectionId: splittedClass[1]
    }
    let response = this.service.getAssignSubjectCustomSearch(dto);
    response.subscribe((data:any) => {
      this.assignedSubjects = data;
      console.log(this.assignedSubjects);
    });
  }

  teachersList: TeacherDto[];
  viewAllTeachers(){
    let response = this.service.findTeacherByRoles();
    response.subscribe((data:any) => {
      this.teachersList = data;
    });
  }

  saveOptionalSubjectTimeTable(){
    const classname = this.createOptionalSubjectClassTimeTableForm.value.classname;
    let splittedClass = classname.split(" ");
    let dto: AssignSubjectsTeacherDto = {
      sessionName: this.createOptionalSubjectClassTimeTableForm.value.sessionname,
      classId: splittedClass[0],
      sectionId: splittedClass[1],
      subjectId: this.createOptionalSubjectClassTimeTableForm.value.subjectname,
      teacherId: this.createOptionalSubjectClassTimeTableForm.value.teachername,
      dayName: this.createOptionalSubjectClassTimeTableForm.value.daysname,
      periodNo: this.createOptionalSubjectClassTimeTableForm.value.periodno
    }
    let response = this.service.saveOptionalSubjectTimeTable(dto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        this.service.fireSwalToast(data.message);
        this.modalService.dismissAll();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

}

import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { ExamDateSheetDto, ExaminationDto, SubjectDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-examination',
  templateUrl: './examination.component.html',
  styleUrls: ['./examination.component.css']
})
export class ExaminationComponent implements OnInit {

  constructor(private modalService: NgbModal, private service: CampusService, private fb: FormBuilder) { }

  closeResult: string;
  data: any;

  ngOnInit(): void {
    this.initializeCreateexamForm();
    this.initializeFilterDatesheetForm();
    this.initializeFilterExamination();
    this.initializeCreateDateForm();
    this.initializeExamFilterModel();
    this.getAllSession();
    this.getAllSchedule();
  }

  createExaminationForm: FormGroup;
  filterExamDateSheetForm: FormGroup;
  filterExaminationBySession: FormGroup;
  createExamDateSheetForm: FormGroup;
  initializeCreateexamForm(){
    this.createExaminationForm = new FormGroup({
      'sessionname': new FormControl("", Validators.required),
      'examname': new FormControl(null, Validators.required),
      'classid': new FormControl(null, Validators.required),
      'examstartdate': new FormControl(null, Validators.required),
      'examenddate': new FormControl(null, Validators.required),
      'examtype': new FormControl(null, Validators.required)
    });
  }

  get dclassname() { return this.filterExamDateSheetForm.get('dclassname') }
  get dsessionname() { return this.filterExamDateSheetForm.get('dsessionname') }
  get dexamname() { return this.filterExamDateSheetForm.get('dexamname') }

  initializeFilterDatesheetForm(){
    this.filterExamDateSheetForm = new FormGroup({
      'dsessionname': new FormControl("", Validators.required),
      'dexamname': new FormControl("", Validators.required),
      'dclassname': new FormControl("", Validators.required),
    });
  }

  initializeFilterExamination(){
    this.filterExaminationBySession = new FormGroup({
      'sessionid': new FormControl(''),
      'className': new FormControl(null)
    });
  }

  initializeCreateDateForm(){
    this.createExamDateSheetForm = this.fb.group({
      examid: ['', Validators.required],
      examstartdate: ['', Validators.required],
      examenddate: ['', Validators.required],
      subjectarrayform: this.fb.array([this.initializeSubjectArray(null)])
    });
  }

  initializeSubjectArray(item:any) {
    if(!item){
      var item:any = {
        subjectCode: "",
        subjectName: "",
        subjectExamDate: ""
      }
    }
    return this.fb.group({
      subjectCode: [item.subjectCode, Validators.required],
      subjectName: [item.subjectName, Validators.required],
      subjectExamDate: [item.subjectExamDate? new Date(item.subjectExamDate).toISOString().split('T')[0] : '', Validators.required]
    });
  }

  addNewField(item:any){
    this.subjectarray.push(this.initializeSubjectArray(item));
  }

  removeControl(index: number){
    this.subjectarray.removeAt(index);
    
  }

  get subjectarray() {
    return this.createExamDateSheetForm.get('subjectarrayform') as FormArray;
  }

  setDefaulltValue(){
    this.createExaminationForm.patchValue({
      sessionname: "",
      examname: null,
      classid: "",
      examstartdate: new Date().toISOString().split('T')[0],
      examenddate: new Date().toISOString().split('T')[0],
      examtype: ""
    });
  }

  open(createContent: any) {
    this.createExaminationForm.reset();
    this.setDefaulltValue();
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

  openModalDatesheet(datesheetcontent: any){
    this.initializeFilterDatesheetForm();
    this.getAllSession();
    this.getClassList();
    this.modalService.open(datesheetcontent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    this.subjectarray.clear();
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
  getClassList(){
    let response = this.service.getClassListFromAssignedSubject();
    response.subscribe((data:any) => {
      this.classList = data;
    });
  }

  getAllSession(){
    let response = this.service.viewAllDistinctSession();
    response.subscribe((data:any) => {
      this.sessionList = data;
    });
  }

  onSubmit(){
    let examDto: ExaminationDto = {
      sessionName: this.createExaminationForm.value.sessionname,
      examName: this.createExaminationForm.value.examname,
      classId: this.createExaminationForm.value.classid,
      examStartDate: this.createExaminationForm.value.examstartdate,
      examEndDate: this.createExaminationForm.value.examenddate,
      examType: this.createExaminationForm.value.examtype
    }
    console.log("Subitting the data: ", examDto);
    let response = this.service.createExamination(examDto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  examinationList: ExaminationDto[];
  viewExaminationList(){
    let dto: ExaminationDto = {
      sessionName: this.filterExamDateSheetForm.value.dsessionname,
      classId: this.filterExamDateSheetForm.value.dclassname
    }
    let response = this.service.getAllExamination(dto);
    response.subscribe((data:any) => {
      this.examinationList = data;
    });
  }

  
  searchExamBySession(sessionName: string, className: string){
    console.log("Session Name: ", this.filterExamDateSheetForm.value.dsessionname);
    let dto: ExaminationDto = {
      sessionName: sessionName,
      classId: className
    }
    let response = this.service.getAllExamination(dto);
    response.subscribe((data:any) => {
      this.examinationList = data;
    });
  }

  examinationDto: ExaminationDto;
  viewExamDatesheet(){
    let examDto: ExaminationDto = {
      sessionName: this.filterExamDateSheetForm.value.dsessionname,
      classId: this.filterExamDateSheetForm.value.dclassname,
      examName: this.filterExamDateSheetForm.value.dexamname
    }
    let response = this.service.findDistinctSubjectsByClass(examDto);
    response.subscribe((data:any) => {
      this.examinationDto = data;
      console.log(this.examinationDto);
      this.createExamDateSheetForm.patchValue({
        examid: this.examinationDto.id,
        examstartdate: new Date(this.examinationDto.examStartDate).toISOString().split('T')[0],
        examenddate: new Date(this.examinationDto.examEndDate).toISOString().split('T')[0]
      });
      let subjects: SubjectDto[] = this.examinationDto.subjectsDtoList;
      this.subjectarray.clear();
      for (let i = 0; i < subjects.length; i++) {
        const element = subjects[i];
        this.addNewField(element);
      }
    });
  }

  saveDatesheet(){
    let examDatesheet: ExamDateSheetDto = {
      examId: this.createExamDateSheetForm.value.examid,
      courseExamData: JSON.stringify(this.createExamDateSheetForm.value.subjectarrayform)
    }

    let response = this.service.saveExamSchedule(examDatesheet);
    this.fireSwalToast("Preparing Datesheet for exam don't refresh this page.",'info');
    response.subscribe((data:any) => {
      Swal.fire("Processing","Preparing Datesheet for exam",'info');
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.modalService.dismissAll();
        this.getAllSchedule();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  changeDate(index: number){
    let array = this.createExamDateSheetForm.value.subjectarrayform;
    const examStartDate = this.createExamDateSheetForm.value.examstartdate;
    const examEndDate = this.createExamDateSheetForm.value.examenddate;
    const examDate = array[index].subjectExamDate;
    console.log("From Date: ", examStartDate, " To Date: ", examEndDate, " Selected Date: ", examDate);
    if (examDate < examStartDate || examDate > examEndDate){
      Swal.fire("Warning","Dates should be between Exam Start Date and End Date",'info');
      console.log(examDate);
    }

  }

  examDateSheetList: any[];
  getAllSchedule(){
    let dto: ExaminationDto = {
      sessionName: this.filterExaminationForm.value.fsessionname,
      classId: this.filterExaminationForm.value.fclassname,
      examName: this.filterExaminationForm.value.fexamname
    }
    let response = this.service.getAllSchedule(dto);
    response.subscribe((data:any) => {
      this.examDateSheetList = data;
      this.modalService.dismissAll();
      console.log(data);
    });
  }

  deleteExamination(examDto: ExaminationDto){
    let response = this.service.deleteExamination(examDto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        this.fireSwalToast(data.message, 'success');
      }
    });
  }
  private fireSwalToast(data: any, iconName: any) {
    const Toast = Swal.mixin({
      toast: true,
      position: 'bottom-left',
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast'
      },
      showConfirmButton: false,
      timer: 5000,
      timerProgressBar: true
    });
    Toast.fire({
      icon: iconName,
      title: data
    });
  }

  deleteSubjectFromExamDateSheet(item: any){
    let response = this.service.deleteExamAndStudentMarkList(item);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        this.fireSwalToast(data.message, 'success');
        this.getAllSchedule();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  filterExaminationForm: FormGroup;

  get fclassname() { return this.filterExaminationForm.get('fclassname') }
  get fsessionname() { return this.filterExaminationForm.get('fsessionname') }
  get fexamname() { return this.filterExaminationForm.get('fexamname') }

  initializeExamFilterModel(){
    this.filterExaminationForm = new FormGroup({
      'fsessionname': new FormControl(""),
      'fclassname': new FormControl(""),
      'fexamname': new FormControl("")
    });
  }

  openFilterModel(createContenet: any) {
    this.filterExaminationForm.reset();
    this.initializeExamFilterModel();
    this.getClassList();
    this.modalService.open(createContenet, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true, animation: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

}

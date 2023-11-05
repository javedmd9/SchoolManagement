import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { SchoolSession, SubjectDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-class-subject',
  templateUrl: './class-subject.component.html',
  styleUrls: ['./class-subject.component.css']
})
export class ClassSubjectComponent implements OnInit {

  constructor(private service: CampusService, private modalService: NgbModal) { }

  ngOnInit(): void {
    this.initializeCreateForm();
    this.setDefaulltValue();
    this.viewAllSubjects();
    this.initializeCreateSessionForm();
    this.getCurrentSession();
  }

  createSubjectForm: FormGroup;
  initializeCreateForm(){
    this.createSubjectForm = new FormGroup({
      'subjectcode': new FormControl('', Validators.required),
      'subjectname': new FormControl('', Validators.required)
    });
  }
  setDefaulltValue(){
    this.createSubjectForm.patchValue({
      subjectcode: "",
      subjectname: ""
    });
  }

  onSubmit(){
    if(this.createSubjectForm.valid){
      let subjectData: SubjectDto = {
        subjectCode: this.createSubjectForm.value.subjectcode,
        subjectName: this.createSubjectForm.value.subjectname
      }
      let response = this.service.saveSubject(subjectData);
      response.subscribe((data:any) => {
        if(data.result.toUpperCase() == "SUCCESS"){
          this.fireSwalToast(data);
          // Swal.fire(data.result, data.message, 'success');
          this.setDefaulltValue();
          this.viewAllSubjects();
        }
      });
    }
  }

  classSubjects: SubjectDto[];
  private fireSwalToast(data: any) {
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
      icon: 'success',
      title: data.message
    });
  }

  viewAllSubjects(){
    let response = this.service.viewAllSubjects();
    response.subscribe((data:any) => {
      this.classSubjects = data;
      console.log(this.classSubjects);
    });
  }

  deleteSubject(dto: SubjectDto){
    let response = this.service.deleteSubject(dto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        // Swal.fire(data.result, data.message, 'success');
        const Toast = Swal.mixin({
          toast: true,
          position: 'top-right',
          iconColor: 'white',
          customClass: {
            popup: 'colored-toast'
          },
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
        Toast.fire({
          icon: 'success',
          title: 'Success'
        });
        this.viewAllSubjects();
      }
    });
  }

  createSessionForm: FormGroup;
  closeResult: string;
  addSession(createContent: any) {
    this.getAllSession();
    this.createSessionForm.reset();
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

  initializeCreateSessionForm(){
    this.createSessionForm = new FormGroup({
      'sessionname': new FormControl(null, Validators.required)
    });
  }

  sessionList: SchoolSession[];
  currentSession: SchoolSession = new SchoolSession();
  saveSession(){
    let sessionDto: SchoolSession = {
      sessionName: this.createSessionForm.value.sessionname
    }
    let response = this.service.createSession(sessionDto);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.createSessionForm.reset();
        this.getAllSession();
      } else {
        Swal.fire(data.result, data.message, 'info');
      }
    });
  }

  getAllSession(){
    let response = this.service.viewAllSession();
    response.subscribe((data:any) => this.sessionList = data);
  }

  deleteSession(sessionId: SchoolSession){
    let response = this.service.deleteSession(sessionId);
    response.subscribe((data:any) => {
      if(data.result.toUpperCase() == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.getAllSession();
      }
    });
  }

  getCurrentSession(){
    let response = this.service.getCurrentSession();
    response.subscribe((data:any) => {
      this.currentSession = data;
      console.log("Current session: ", this.currentSession);
    });
  }

}

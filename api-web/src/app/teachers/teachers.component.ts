import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Observable, ReplaySubject } from 'rxjs';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { Roles } from '../security/authRequestDto.model';
import { TeacherDto } from './teacher.model';

@Component({
  selector: 'app-teachers',
  templateUrl: './teachers.component.html',
  styleUrls: ['./teachers.component.css']
})
export class TeachersComponent implements OnInit {

  generateTeacherCode: number;
  closeResult: string;
  message: string;

  constructor(private modalService: NgbModal, private teacherService: CampusService, private router: Router) { }

  public viewTeacher(code: number){
    this.router.navigate(['/user-profile'], { queryParams: { teacherCode: code} });
  }

  editTeacherData: boolean;
  viewTeacherProfile: boolean;
  createTeacher: boolean;
  deleteTeacherRec: boolean;
  staffRoles: Roles[] = [];
  uploadImageURL: string = "";
  ngOnInit(): void {
    this.initializeCreateForm();
    this.initializeUpdateForm();
    this.initializeTeacherPhotoUploadForm();
    this.initializeCriteriaForm();
    this.viewAllTeacher();
    this.setDefaultValues();
    this.validatePermissions();
    this.getAllRoles();
  }

  private validatePermissions() {
    this.createTeacher = this.teacherService.permissionService(['CREATE TEACHER']);
    this.editTeacherData = this.teacherService.permissionService(['EDIT TEACHER']);
    this.deleteTeacherRec = this.teacherService.permissionService(['DELETE TEACHER']);
    this.viewTeacherProfile = this.teacherService.permissionService(['VIEW TEACHER PROFILE']);
  }

  private getAllRoles(){
    let response = this.teacherService.getAllRoles();
    response.subscribe((data:any) => {
      this.staffRoles = data;
    });
  }

  open(createContent: any) {
    this.createTeacherForm.reset();
    this.initializeCreateForm();
    this.setDefaultValues();
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }

  selectedTeacher: TeacherDto;
  teacherPic: File;
  //opens when clicked on Edit button
  onEdit(updateContent: any, inService: TeacherDto) {
    this.selectedTeacher = inService;
    this.getTeacherCode1 = inService.teacherCode;
    console.log(this.selectedTeacher);
    this.teacherPic = inService.teacherPhoto;
    // Display the inputs if radio button is checked or not
    if(inService.classId == null){
      this.isClassIncharge = false;
      this.isClassInchargeNo = true;
      this.isClassInchargeYes = false;
    } else {
      this.isClassIncharge = true;
      this.isClassInchargeYes = true;
      this.isClassInchargeNo = false;
    }
    // //update class rooms Copy
    this.updateTeacherForm.patchValue({
      utid: inService.id,
      uteachername: inService.teacherName,
      uteachercode: Number(inService.teacherCode),
      ufathername: inService.fatherName,
      usubjectappointed: inService.subjectAppointed,
      utaddress: inService.taddress,
      udob: new Date(inService.dob).toISOString().split('T')[0],
      upost: inService.post,
      unappointment: inService.nappointment,
      ujoining: new Date(inService.dateOfJoining).toISOString().split('T')[0],
      ustatus: inService.status,
      pteachercode: inService.teacherCode,
      ustaffrole: inService.staffRole,
      uphoneNo: inService.phoneNo,
      uemail: inService.email,
      uclassId: inService.classId? inService.classId : null,
      usectionId: inService.sectionId? inService.sectionId : null
    });
    console.log(this.updateTeacherForm);

    this.modalService.open(updateContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true }).result.then((result) => {
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

  dismissModel() {
    this.modalService.dismissAll();
  }

  uploadTeacherPhoto: TeacherDto;
  getTeacherCode1: number;
  openPhotoUploadForm(photoUploadContent: any){
    // this.getTeacherCode1 = Number(this.updateTeacherForm.value.uteachercode);
    console.log("Teacher Code: ", this.getTeacherCode1);
    let response = this.teacherService.findTeacherByTeacherCode(this.getTeacherCode1);
    response.subscribe((data:any) => {
      this.uploadTeacherPhoto = data;
      console.log(this.uploadTeacherPhoto);
      this.uploadTeacherPhotoForm.patchValue({
        eteacherId: this.uploadTeacherPhoto.id,
        eteacherPhoto: null
      });
    });
    this.modalService.open(photoUploadContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  createTeacherForm: FormGroup;
  criteriaForm: FormGroup;
  initializeCreateForm() {

    this.createTeacherForm = new FormGroup({
      'teachercode': new FormControl({ value: this.generateTeacherCode, disabled: true }),
      'teachername': new FormControl(null, Validators.required),
      'fathername': new FormControl(null, Validators.required),
      'subjectappointed': new FormControl(null, Validators.required),
      'taddress': new FormControl(null, Validators.required),
      'dob': new FormControl(null, Validators.required),
      'post': new FormControl(null, Validators.required),
      'nappointment': new FormControl(null, Validators.required),
      'joining': new FormControl(null, Validators.required),
      'status': new FormControl(null, Validators.required),
      'classId': new FormControl(null),
      'sectionId': new FormControl(null),
      'phoneNo': new FormControl(null, Validators.required),
      'email': new FormControl(null, [Validators.email, Validators.required]),
      'staffrole': new FormControl(null, Validators.required),
      'teacherPhoto': new FormControl(null)
    });
  }
  updateTeacherForm: FormGroup;
  initializeUpdateForm() {

    this.updateTeacherForm = new FormGroup({
      'utid': new FormControl(null),
      'uteachercode': new FormControl({ value: null, disabled: true }),
      'uteachername': new FormControl(null, Validators.required),
      'ufathername': new FormControl(null, Validators.required),
      'usubjectappointed': new FormControl(null, Validators.required),
      'utaddress': new FormControl(null, Validators.required),
      'udob': new FormControl(null, Validators.required),
      'upost': new FormControl(null, Validators.required),
      'unappointment': new FormControl(null, Validators.required),
      'ujoining': new FormControl(null, Validators.required),
      'ustatus': new FormControl(null, Validators.required),
      'uteacherPhoto': new FormControl(null),
      'uclassId': new FormControl(null),
      'usectionId': new FormControl(null),
      'uphoneNo': new FormControl(null, Validators.required),
      'uemail': new FormControl(null, [Validators.required, Validators.email]),
      'ustaffrole': new FormControl("", Validators.required),
      'pteachercode': new FormControl(null),

    });
  }
  uploadTeacherPhotoForm: FormGroup;
  initializeTeacherPhotoUploadForm() {

    this.uploadTeacherPhotoForm = new FormGroup({
      'eteacherId': new FormControl({ value: null }),
      'eteacherPhoto': new FormControl({ value: null }, Validators.required),
      
    });
    this.uploadTeacherPhotoForm.patchValue({
      eteacherId: null,
      eteacherPhoto: null
    });
  }

  get teachercode() { return this.createTeacherForm.get('teachercode') }
  get teachername() { return this.createTeacherForm.get('teachername') }
  get fathername() { return this.createTeacherForm.get('fathername') }
  get subjectappointed() { return this.createTeacherForm.get('subjectappointed') }
  get taddress() { return this.createTeacherForm.get('taddress') }
  get dob() { return this.createTeacherForm.get('dob') }
  get post() { return this.createTeacherForm.get('post') }
  get nappointment() { return this.createTeacherForm.get('nappointment') }
  get joining() { return this.createTeacherForm.get('joining') }
  get status() { return this.createTeacherForm.get('status') }
  get roles() { return this.createTeacherForm.get('staffrole') }
  get phoneNo() { return this.createTeacherForm.get('phoneNo') }
  get email() { return this.createTeacherForm.get('email') }
  get teacherPhoto() { return this.createTeacherForm.get('teacherPhoto') }


  initializeCriteriaForm() {
    this.criteriaForm = new FormGroup({
      'tfiltername': new FormControl('')
    });
  }

  setDefaultValues() {
    this.createTeacherForm.reset();
    this.getTeacherCode();
    console.log("Inside set default: " + this.generateTeacherCode);
    this.createTeacherForm.patchValue(
      {
        id: null,
        teachername: "",
        teachercode: this.generateTeacherCode,
        fathername: "",
        subjectappointed: "",
        taddress: "",
        dob: null,
        post: "TGT",
        nappointment: "Permanent",
        joining: null,
        status: "Active",
        phoneNo: null,
        email: null,
        staffrole: "",
        teacherPhoto: null
      }
    );
    this.criteriaForm.patchValue({
      tfiltername: "",
    });
  }

  public getTeacherCode() {
    let response = this.teacherService.getTeacherCode();
    response.subscribe((data: any) => {
      this.generateTeacherCode = data;
      console.log("Generated Teacher code: ",this.generateTeacherCode);
    });

  }
// un used code for uploading file
  afuConfig = {
    formatsAllowed: ".jpg,.png",
    uploadAPI: {
      url: "",
    },
    replaceTexts: {
      selectFileBtn: 'Select Files',
      resetBtn: 'Reset',
      attachPinBtn: 'Attach Files...',
      afterUploadMsg_success: 'Successfully Uploaded !',
      afterUploadMsg_error: 'Upload Failed !',
      sizeLimit: 'Size Limit'
    }
  };


  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    // reader.readAsBinaryString(file);
    reader.readAsDataURL(file);
    reader.onload = (event) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  selectedFile: File;
  onFileSelected(event) {
    // this.convertFile(event.target.files[0]).subscribe(base64 => {
    //   this.selectedFile = base64;
    //   console.log(this.selectedFile);
    // });
    this.selectedFile = event.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (event:any) => {
      this.uploadImageURL = event.target.result;
    }
  }

  public uploadFile(){
    let uploadPhoto: TeacherDto = {
      id: this.uploadTeacherPhotoForm.value.eteacherId,
      teacherCode: null,
      teacherName: null,
      fatherName: null,
      subjectAppointed: null,
      taddress: null,
      dob: null,
      post: null,
      nappointment: null,
      dateOfJoining: null,
      status: null
    }
    let response = this.teacherService.updateTeacherPhoto(uploadPhoto, this.selectedFile);
    response.subscribe((data:any) => {
      this.message = data.result;
      console.log(this.message);
      if (this.message == 'SUCCESS') {
        Swal.fire("Success", '', 'success');
        this.teacherService.getAllTeachers().subscribe((data: any) => this.teachers = data);
        this.modalService.dismissAll();
      } else {
        Swal.fire("Something went wrong", '', 'info');
      }
    });
  }

  public onSubmit() {
    let classId: string;
    let sectionId: string;
    if(this.isClassIncharge == true){
      classId = this.createTeacherForm.value.classId;
      sectionId = this.createTeacherForm.value.sectionId;
    } else {
      classId = null;
      sectionId = null;
    }
    if (this.createTeacherForm.valid) {
      let createTeacher: TeacherDto = {
        teacherCode: this.generateTeacherCode,
        teacherName: this.createTeacherForm.value.teachername,
        fatherName: this.createTeacherForm.value.fathername,
        subjectAppointed: this.createTeacherForm.value.subjectappointed,
        taddress: this.createTeacherForm.value.taddress,
        dob: this.createTeacherForm.value.dob,
        post: this.createTeacherForm.value.post,
        nappointment: this.createTeacherForm.value.nappointment,
        dateOfJoining: this.createTeacherForm.value.joining,
        status: this.createTeacherForm.value.status,
        phoneNo: this.phoneNo.value,
        email: this.email.value,
        staffRole: this.roles.value,
        classId: classId,
        sectionId: sectionId,
        // teacherPhoto: this.teacherPhoto
      }


      let response = this.teacherService.addTeacher(createTeacher, this.selectedFile);
      response.subscribe((data: any) => {
        this.message = data.result;
        console.log(this.message);
        if (this.message == 'SUCCESS') {
          Swal.fire("Success", '', 'success');
          this.teacherService.getAllTeachers().subscribe((data: any) => this.teachers = data);
          this.modalService.dismissAll();
        } else {
          Swal.fire("Something went wrong", '', 'info');
        }

      });
    }
  }

  teachers: TeacherDto[] = new Array();
  viewAllTeacher() {
    let response = this.teacherService.getAllTeachers();
    response.subscribe((data: any) => {
      this.teachers = data;
      console.log(this.teachers);
    });
  }

  onUpdate(){
    let classId: string;
    let sectionId: string;
    if(this.isClassIncharge == true){
      classId = this.updateTeacherForm.value.uclassId;
      sectionId = this.updateTeacherForm.value.usectionId;
    } else {
      classId = null;
      sectionId = null;
    }
    let updateTeacher: TeacherDto = {
      id: this.updateTeacherForm.value.utid,
      teacherCode: this.getTeacherCode1,
      teacherName: this.updateTeacherForm.value.uteachername,
      fatherName: this.updateTeacherForm.value.ufathername,
      subjectAppointed: this.updateTeacherForm.value.usubjectappointed,
      taddress: this.updateTeacherForm.value.utaddress,
      dob: this.updateTeacherForm.value.udob,
      post: this.updateTeacherForm.value.upost,
      nappointment: this.updateTeacherForm.value.unappointment,
      dateOfJoining: this.updateTeacherForm.value.ujoining,
      status: this.updateTeacherForm.value.ustatus,
      phoneNo: this.updateTeacherForm.value.uphoneNo,
      email: this.updateTeacherForm.value.uemail,
      staffRole: this.updateTeacherForm.value.ustaffrole,
      classId: classId,
      sectionId: sectionId,
      teacherPhoto: this.teacherPic
    }
    console.log(updateTeacher);
    let response = this.teacherService.updateTeacherDto(updateTeacher);
    response.subscribe((data:any) => {
      this.message = data.result;
          console.log(this.message);
          if (this.message == 'SUCCESS') {
            let itemIndex = this.teachers.findIndex(item => item.id == updateTeacher.id);
            this.teachers[itemIndex] = updateTeacher;
            console.log("Updated teacher id: ", this.teachers[itemIndex]);
            Swal.fire("Success","Updated Teacher\'s Info.", 'success');
            this.dismissModel();
          }
    });
  }

  deleteTeacher(teacher: TeacherDto) {
    Swal.fire({
      title: 'Are you sure you want to delete the record?',
      color: '#000000',
      cancelButtonColor: '#716add',
      confirmButtonColor: '#f96332',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // your code for deletion, etc.
        let response = this.teacherService.deleteTeacher(teacher);
        response.subscribe((data: any) => {
          this.message = data.result;
          console.log(this.message);
          if (this.message == 'SUCCESS') {
            this.teachers = this.teachers.filter(item => item.id != teacher.id);
            console.log("Deleted Teacher.");
          } else {
            result.isDenied;
            // Swal.fire('Sorry!\n unable to deleted.', '', 'info')
          }
        });

      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info');
      }
    });
  }

  isClassIncharge: boolean = false;
  isClassInchargeYes: boolean = false;
  isClassInchargeNo: boolean = false;
  checkClassIncharge($event:any){
    if($event.target.value == 'Yes'){
      this.isClassIncharge = true;
    } else {
      this.isClassIncharge = false;
    }
  }
  

}

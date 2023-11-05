import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators, FormArray, FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import readXlsxFile from 'read-excel-file';
import Swal from 'sweetalert2';
import { CampusService } from '../campus.service';
import { StudentDocumentDto, StudentDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit {

  constructor(private modalService: NgbModal, private service: CampusService, private router: Router, private fb: FormBuilder) { }

  closeResult: string;
  message: string;
  data: any;
  selectedFile: File;
  studentList: StudentDto[];

  ngOnInit(): void {
    this.initializeCreateForm();
    this.initializeUpdateForm();
    this.setDefaultValue();
    this.initializeUploadDocumentForm();
    // this.initializeUploadDocumentForm2();
    this.initializeTeacherPhotoUploadForm();
    this.viewAllStudents();
    this.validatePermissions();
  }

  compare: boolean;
  canEdit: boolean;
  canApprove: boolean;
  canReject: boolean;
  canDelete: boolean;
  canViewDocument: boolean;
  canCreateStudent: boolean;
  canUploadDocument: boolean;
  bulkUploadData: boolean;
  validatePermissions(){
    this.compare = this.service.permissionService(['APPROVE STUDENT UPDATE']);
    this.canEdit = this.service.permissionService(['UPDATE STUDENT']);
    this.canApprove = this.service.permissionService(['APPROVE STUDENT UPDATE']);
    this.canReject = this.service.permissionService(['REJECT STUDENT UPDATE']);
    this.canDelete = this.service.permissionService(['DELETE STUDENT']);
    this.canViewDocument = this.service.permissionService(['VIEW STUDENT DOCUMENT']);
    this.canCreateStudent = this.service.permissionService(['CREATE STUDENT']);
    this.canUploadDocument = this.service.permissionService(['UPLOAD STUDENT DOCUMENT']);
    this.bulkUploadData = this.service.permissionService(['BULK UPLOAD STUDENT DATA']);
  }

  onFileSelected(event){
    this.selectedFile = event.target.files[0];
  }

  selectedDocument: File[] = [];
  onMultipleFileSelected(event){
    const fileelement = event.target.files[0];
    this.selectedDocument.push(fileelement);
  }

  open(createContent: any) {
    this.createStudentForm.reset();
    let checkBoolean = this.service.permissionService(['CREATE STUDENT']);
    this.setDefaultValue();
    this.addressType = "";
    if(checkBoolean !=false){
      this.modalService.open(createContent, {
        ariaLabelledBy: 'modal-basic-title',
        size: 'lg', centered: true
      }).result.then((result) => {
        this.closeResult = `Closed with: ${result}`;
      }, (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      });
    }
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

  selectedStudent: StudentDto;
  studentPic: string;
  onEdit(updateContent:any, inService: StudentDto){
    this.selectedStudent = inService;
    console.log(inService);
    this.studentPic = inService.studentPhoto;
    this.updateStudentForm.patchValue({
      uid: inService.id,
      uadmissionno: inService.admissionNo,
      ustudentname: inService.studentName,
      ufathrename: inService.fatherName,
      umothername: inService.motherName,
      uclass: inService.classId,
      usection: inService.sectionId,
      udob: new Date(inService.dob).toISOString().split('T')[0],
      uadmissiondate: new Date(inService.admissionDate).toISOString().split('T')[0],
      ugender: inService.gender,
      ureligion: inService.religion,
      ucast: inService.castType,
      ufphone: inService.fatherPhoneNumber,
      umphone: inService.motherPhoneNumber,
      uaadharno: inService.aadhaarNo,
      uaddresstype: inService.addressType,
      uvillage: inService.villageAddress,
      upostoffice: inService.postOffice,
      upolicestation: inService.policeStation,
      udistrict: inService.districtName,
      uurbanaddress: inService.urbanAddress,
    });
    this.onUAddressSelect(inService.addressType);
    this.modalService.open(updateContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  viewStudentDoc: StudentDto;
  documentData: any;
  
  openDocModal(viewDocContent:any, studentData: StudentDto){
    this.viewStudentDoc = studentData;
    let documentsList: StudentDocumentDto;
    let response = this.service.viewAllStudentDocuments(studentData.admissionNo);
    response.subscribe((data:any) => {
      documentsList = data;
      this.documentData = JSON.parse(documentsList.documentData);
      console.log(this.documentData);
    });
    this.modalService.open(viewDocContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  

  uploadDocument(uploadContent: any) {
    this.uploadDocumentForm.reset();
    this.uploadDocumentForm.patchValue({
      eadmissionno: this.viewStudentDoc.admissionNo,
    });
    this.modalService.open(uploadContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    console.log(this.uploadDocumentForm);
  }

  deleteDocument(admissionNo: string, docName: string){
    console.log(admissionNo,docName);
    let documentsList: StudentDocumentDto;
    let response = this.service.deleteStudentDocument(admissionNo, docName);
    response.subscribe((data:any) => {
      documentsList = data;
      this.documentData = JSON.parse(documentsList.documentData);
      console.log(this.documentData);
      Swal.fire("Success","Selected document is deleted.", "info");
    });
  }

  initializeUploadDocumentForm() {
    
    this.uploadDocumentForm = this.fb.group({
      eadmissionno: [this.updateStudentForm.value.uadmissionno],
      documentrows: this.fb.array([this.initializeDocumentArray()])
    });
    
  }

  // uploadStudentDocument: FormArray;
  // initializeUploadDocumentForm2() {

  //   this.uploadStudentDocument = new FormArray([
  //     new FormControl({
  //       'edocumentno': new FormControl(null),
  //       'edocumentname': new FormControl(null),
  //       'estudentdocument': new FormControl(null),
  //     })
  //   ]);
    
  // }

  initializeDocumentArray(){
    return this.fb.group({
      edocumentname: [''],
      estudentdocument: ['']
    });
  }

  get formDocumentArray(){
    return this.uploadDocumentForm.get('documentrows') as FormArray;
  }

  get f(){
    return this.uploadDocumentForm.controls;
  }

  addNewField() {
    // this.uploadStudentDocument.push(new FormControl(''));
    // console.log(this.uploadStudentDocument);
    this.formDocumentArray.push(this.initializeDocumentArray());
    console.log(this.formDocumentArray);
    
  }

  removeControl(index: number){
    // this.uploadStudentDocument.removeAt(index);
    // console.log(this.uploadStudentDocument);
    this.formDocumentArray.removeAt(index);
    
  }

  uploadFile(){
    let array = this.uploadDocumentForm.value.documentrows;
    // console.log(this.uploadDocumentForm.value);
    // console.log(this.uploadDocumentForm.value.documentrows);


    // for (let i = 0; i < array.length; i++) {
    //   const element = array[i].edocumentname;
    //   console.log(element);
    // }
    
    // for (let j = 0; j < this.selectedDocument.length; j++) {
      
    //   console.log(j, this.selectedDocument[j]);
      
    // }
    let documents: StudentDocumentDto = {
      admissionNo: this.uploadDocumentForm.value.eadmissionno,
      documentData: JSON.stringify(this.uploadDocumentForm.value.documentrows)
    }
    console.log("Data going to backend: ",documents,this.selectedDocument);
    let response = this.service.saveDocuments(documents, this.selectedDocument);
    response.subscribe((data:any) => {
      Swal.fire(data.result,'success');
      this.modalService.dismissAll();
    },
    ((error) => {
      Swal.fire("Error","Unable to upload", 'info');
      this.dismissModel();
      
    }));
  }

  

  createStudentForm: FormGroup;
  uploadDocumentForm: FormGroup;
  updateStudentForm: FormGroup;
  public initializeCreateForm() {
    this.createStudentForm = new FormGroup({
      'admissionno': new FormControl(null, Validators.required),
      'studentname': new FormControl(null),
      'fathrename': new FormControl(null),
      'mothername': new FormControl(null),
      'class': new FormControl(null),
      'section': new FormControl(null),
      'dob': new FormControl(null),
      'admissiondate': new FormControl(new Date()),
      'gender': new FormControl(null),
      'religion': new FormControl(null),
      'cast': new FormControl(null),
      'fphone': new FormControl(null),
      'mphone': new FormControl(null),
      'aadharno': new FormControl(null),
      'addresstype': new FormControl(null),
      'village': new FormControl(null),
      'postoffice': new FormControl(null),
      'policestation': new FormControl(null),
      'district': new FormControl(null),
      'urbanaddress': new FormControl(null),
      'studentphoto': new FormControl(null),
    });
  }

  public initializeUpdateForm() {
    this.updateStudentForm = new FormGroup({
      'uid': new FormControl(null),
      'uadmissionno': new FormControl(null, Validators.required),
      'ustudentname': new FormControl(null),
      'ufathrename': new FormControl(null),
      'umothername': new FormControl(null),
      'uclass': new FormControl(null),
      'usection': new FormControl(null),
      'udob': new FormControl(null),
      'uadmissiondate': new FormControl(new Date()),
      'ugender': new FormControl(null),
      'ureligion': new FormControl(null),
      'ucast': new FormControl(null),
      'ufphone': new FormControl(null),
      'umphone': new FormControl(null),
      'uaadharno': new FormControl(null),
      'uaddresstype': new FormControl(null),
      'uvillage': new FormControl(null),
      'upostoffice': new FormControl(null),
      'upolicestation': new FormControl(null),
      'udistrict': new FormControl(null),
      'uurbanaddress': new FormControl(null),
      'ustudentphoto': new FormControl(null),
    });
  }

  public setDefaultValue() {
    this.createStudentForm.patchValue({
      admissionno: "",
      studentname: "",
      fathrename: "",
      mothername: "",
      class: "",
      section: "",
      dob: null,
      admissiondate: new Date(),
      gender: "",
      religion: "",
      cast: "",
      fphone: "",
      mphone: "",
      aadharno: "",
      addresstype: "",
      village: "",
      postoffice: "",
      policestation: "",
      district: "",
      urbanaddress: "",
      studentphoto: null
    });
  }

  addressType: string;
  public onAddressSelect(addresstype: string) {
    // this.addressType = "";
    if(addresstype != null){
      this.addressType = addresstype;
    } else {
      this.addressType = this.createStudentForm.value.addresstype;
    }
    console.log(this.addressType);
    
  }
  uAddressType: string;
  public onUAddressSelect(addresstype: string) {
    // this.addressType = "";
    if(addresstype != null){
      this.uAddressType = addresstype;
    } else {
      this.uAddressType = this.updateStudentForm.value.uaddresstype;
    }
    console.log(this.uAddressType);
    
  }

  onSubmit(){
    let createStudent: StudentDto = {
      studentName: this.createStudentForm.value.studentname,
      admissionNo: this.createStudentForm.value.admissionno,
      fatherName: this.createStudentForm.value.fathrename,
      motherName: this.createStudentForm.value.mothername,
      classId: this.createStudentForm.value.class,
      sectionId: this.createStudentForm.value.section,
      dob: this.createStudentForm.value.dob,
      admissionDate: this.createStudentForm.value.admissiondate,
      addressType: this.createStudentForm.value.addresstype,
      urbanAddress: this.createStudentForm.value.urbanaddress,
      villageAddress: this.createStudentForm.value.village,
      postOffice: this.createStudentForm.value.postoffice,
      policeStation: this.createStudentForm.value.policestation,
      districtName: this.createStudentForm.value.district,
      gender: this.createStudentForm.value.gender,
      religion: this.createStudentForm.value.religion,
      castType: this.createStudentForm.value.cast,
      fatherPhoneNumber: this.createStudentForm.value.fphone,
      motherPhoneNumber: this.createStudentForm.value.mphone,
      aadhaarNo: this.createStudentForm.value.aadharno
    }
    // console.log("Student Dto: ",createStudent);
    // console.log("Selected File: ", this.selectedFile);
    let response = this.service.createStudent(createStudent,this.selectedFile);
    response.subscribe((data:any) => {
      console.log(data);
      if(data.result == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.dismissModel();
        this.viewAllStudents();
      } else {
        Swal.fire("Sorry!", "Record not saved", 'info');
      }
      
    });

  }
  get studentEmptyDto(): StudentDto{
    let studentData: StudentDto;
    return studentData = {
      studentName: '',
      admissionNo: '',
      fatherName: '',
      motherName: '',
      classId: null,
      sectionId: '',
      dob: undefined,
      admissionDate: undefined,
      addressType: '',
      urbanAddress: '',
      villageAddress: '',
      postOffice: '',
      policeStation: '',
      districtName: '',
      gender: '',
      religion: '',
      castType: '',
      fatherPhoneNumber: '',
      motherPhoneNumber: '',
      aadhaarNo: ''
    }
  }
  
  pages: number;
  p: number = 0;
  itemPerPage: number;
  viewAllStudents(){
    let studentData: StudentDto = {
      studentName: '',
      admissionNo: '',
      fatherName: '',
      motherName: '',
      classId: null,
      sectionId: '',
      dob: undefined,
      admissionDate: undefined,
      addressType: '',
      urbanAddress: '',
      villageAddress: '',
      postOffice: '',
      policeStation: '',
      districtName: '',
      gender: '',
      religion: '',
      castType: '',
      fatherPhoneNumber: '',
      motherPhoneNumber: '',
      aadhaarNo: '',
      
    }
    let response = this.service.getFilteredStudents(studentData);
    response.subscribe((data:any) => {
      console.log("Backend Data: ", data);
      this.studentList = data["content"];
      this.pages = data["totalElements"]
      this.p = data["number"] + 1;
      this.itemPerPage = data["numberOfElements"];
    });
  }

  requestPage: number = 0;
  setPage(i, event) {
    event.preventDefault();
    if(i>0){
      this.requestPage = i;
    } else {
      this.requestPage = 0;
    }
    let studentData: StudentDto = {
      pageNumber: this.requestPage
      
    }
    let response = this.service.getFilteredStudents(studentData);
    response.subscribe((data:any) => {
      this.studentList = data["content"];
      this.pages = data["totalElements"];
      console.log(this.studentList);
    });
  }

  
  deleteStudent(student: StudentDto){
    console.log("Student to delete: ", student.Id);
    Swal.fire({
      title: 'Are you sure you want to delete ' + student.studentName,
      color: '#000000',
      cancelButtonColor: '#716add',
      confirmButtonColor: '#f96332',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // your code for deletion, etc.
        let response = this.service.deleteStudent(student);
        response.subscribe((data: any) => {
          this.message = data.result;
          console.log(data);
          if (this.message == 'SUCCESS') {
            // this.studentList = this.studentList.filter(item => item.Id != student.Id);
            this.viewAllStudents();
            console.log(data.message,'info');
          } else {
            result.isDenied;
            Swal.fire('Sorry!\n unable to deleted.', '', 'info')
          }
        });

      } else if (result.isDenied) {
        Swal.fire('Changes are not saved', '', 'info');
      }
    });
    
  }
  
  onUpdate(){
    let updateStudent: StudentDto = {
      id: this.updateStudentForm.value.uid,
      studentName: this.updateStudentForm.value.ustudentname,
      admissionNo: this.updateStudentForm.value.uadmissionno,
      fatherName: this.updateStudentForm.value.ufathrename,
      motherName: this.updateStudentForm.value.umothername,
      classId: this.updateStudentForm.value.uclass,
      sectionId: this.updateStudentForm.value.usection,
      dob: this.updateStudentForm.value.udob,
      admissionDate: this.updateStudentForm.value.uadmissiondate,
      addressType: this.updateStudentForm.value.uaddresstype,
      urbanAddress: this.updateStudentForm.value.uurbanaddress,
      villageAddress: this.updateStudentForm.value.uvillage,
      postOffice: this.updateStudentForm.value.upostoffice,
      policeStation: this.updateStudentForm.value.upolicestation,
      districtName: this.updateStudentForm.value.udistrict,
      gender: this.updateStudentForm.value.ugender,
      religion: this.updateStudentForm.value.ureligion,
      castType: this.updateStudentForm.value.ucast,
      fatherPhoneNumber: this.updateStudentForm.value.ufphone,
      motherPhoneNumber: this.updateStudentForm.value.umphone,
      aadhaarNo: this.updateStudentForm.value.uaadharno,
      studentPhoto: this.studentPic
    }
    console.log("Student Dto: ",updateStudent);
    // console.log("Selected File: ", this.selectedFile);
    let response = this.service.updateStudent(updateStudent);
    response.subscribe((data:any) => {
      console.log(data);
      if(data.result == "SUCCESS"){
        Swal.fire(data.result, data.message, 'success');
        this.viewAllStudents();
        this.dismissModel();
      } else {
        Swal.fire("Sorry! Record not saved", 'info');
      }
      
    });

  }

  onApprove(student: StudentDto){
    Swal.fire({
      title: 'Are you sure you want to approve the update request?',
      color: '#000000',
      cancelButtonColor: '#716add',
      confirmButtonColor: '#7e6eeb',
      showCancelButton: true,
      confirmButtonText: 'Approve',
      cancelButtonText: 'Cancel',
    }).then((result)=>{
      if(result.isConfirmed){
        let response = this.service.approveStudent(student);
        response.subscribe((data:any) => {
          console.log(data);
          if(data.result == "SUCCESS"){
            Swal.fire(data.result, data.message, 'success');
            this.dismissModel();
            this.viewAllStudents();
          } else {
            Swal.fire("Sorry! Error occured", 'info');
          }
          
        });
      }
    });
    
  }


  onReject(student: StudentDto){
    Swal.fire({
      title: 'Are you sure you want to reject the update request?',
      color: '#000000',
      cancelButtonColor: '#716add',
      confirmButtonColor: '#f96332',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if(result.isConfirmed){
        this.swalFireRejectDialog(student);
      }
    });
    
  }

  studentData: StudentDto;
  public swalFireRejectDialog(student: StudentDto) {
    Swal.fire({
      title: 'Enter Reject Reason',
      input: 'text',
      inputPlaceholder: 'Enter Reason',
      inputValidator: (value) => {
        return !value && "Enter reason"
      },
      showConfirmButton: true,
      confirmButtonText: 'Reject'
    }).then((result: any) => {
      if (result.value) {
        this.studentData = student;
        this.studentReject(result.value);
      }
    });
  }

  studentReject(reason: string){
    this.studentData.rejectReason = reason;
    console.log("Reject Reason: ", this.studentData);
    let response = this.service.rejectStudent(this.studentData);
    response.subscribe((data: any) => {
      console.log(data);
      if (data.result == "SUCCESS") {
        Swal.fire(data.result, data.message, 'success');
        this.dismissModel();
        this.viewAllStudents();
      } else {
        Swal.fire("Sorry! error occured", 'info');
      }
    });
  }

  uploadStudentPhotoForm: FormGroup;
  initializeTeacherPhotoUploadForm() {

    this.uploadStudentPhotoForm = new FormGroup({
      'estudentid': new FormControl({ value: null }),
      'estudentphoto': new FormControl({ value: null }, Validators.required),
      
    });
    
  }

  studentIdNo: number;
  openPhotoUploadForm(photoUploadContent: any){
    this.studentIdNo = this.updateStudentForm.value.uid;
    console.log(this.studentIdNo);
    this.uploadStudentPhotoForm.patchValue({
      estudentid: this.updateStudentForm.value.uid,
      estudentphoto: null
    });
    this.modalService.open(photoUploadContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
    
  }

  public uploadPhoto(){
    let uploadPhoto: StudentDto = {
      id: this.uploadStudentPhotoForm.value.estudentid ,
      studentName: '',
      admissionNo: '',
      fatherName: '',
      motherName: '',
      classId: '',
      sectionId: '',
      dob: null,
      admissionDate: null,
      addressType: '',
      urbanAddress: '',
      villageAddress: '',
      postOffice: '',
      policeStation: '',
      districtName: '',
      gender: '',
      religion: '',
      castType: '',
      fatherPhoneNumber: '',
      motherPhoneNumber: '',
      aadhaarNo: ''
    }
    let response = this.service.updateStudentPhoto(uploadPhoto, this.selectedFile);
    response.subscribe((data:any) => {
      if(data.result == 'SUCCESS'){
        Swal.fire(data.result, data.message, 'success');
        this.viewAllStudents();
        this.modalService.dismissAll();
      } else {
        Swal.fire("Sorry!", "Something went wrong", 'info');
      }
    });
  }
  studentOldData: StudentDto;
  studentNewData: StudentDto;
  onCompare(compareContent:any, studentData: StudentDto){
    console.log(studentData);
    console.log(JSON.parse(studentData.updatedData));
    this.studentOldData = studentData;
    this.studentNewData = JSON.parse(studentData.updatedData);
    this.modalService.open(compareContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  public viewStudent(code: number){
    let url = this.router.serializeUrl(this.router.createUrlTree(['/student-profile'], { queryParams: { admissionNo: code} }));
    window.open(url, '_blank');
    // this.router.navigate(['/student-profile'], { queryParams: { admissionNo: code} });
  }

  openBulkUploadDialog(openBulkModal:any){
    this.modalService.open(openBulkModal, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  studentBulkData: StudentDto[] = [];
  uploadBulkData(uploadBulkData:any){
    let fileReaded: any;
    fileReaded = uploadBulkData.target.files[0];
    let type = uploadBulkData.target.files[0].name.split('.').pop();
    const schema = {
      'Admission No': {
        prop: 'admissionNo',
        type: String,
        required: true
      },
      'Student Name': {
        prop: 'studentName',
        type: String,
        required: true
      },
      'Father Name': {
        prop: 'fatherName',
        type: String,
        required: true
      },
      'Mother Name': {
        prop: 'motherName',
        type: String,
        required: true
      },
      'Class ID': {
        prop: 'classId',
        type: String,
        required: true
      },
      'Section ID': {
        prop: 'sectionId',
        type: String,
        required: true
      },
      'DOB': {
        prop: 'dob',
        type: Date,
        required: true,
        parse(value:string) {
          const [day, month, year] = value.split('-');
          const parsedDate = new Date(Number(year), Number(month)-1, Number(day));
          return parsedDate;
        }
      },
      'Admission Date': {
        prop: 'admissionDate',
        type: Date
      },
      'Address Type': {
        prop: 'addressType',
        type: String,
        required: true
      },
      'Urban Address': {
        prop: 'urbanAddress',
        type: String
      },
      'Village Address': {
        prop: 'villageAddress',
        type: String
      },
      'Post Office': {
        prop: 'villageAddress',
        type: String
      },
      'Police Station': {
        prop: 'policaStation',
        type: String
      },
      'District Name': {
        prop: 'districtName',
        type: String,
        required: true
      },
      'Gender': {
        prop: 'gender',
        type: String
      },
      'Religion': {
        prop: 'religion',
        type: String
      },
      'Cast Type': {
        prop: 'castType',
        type: String
      },
      'Father Phone Number': {
        prop: 'fatherPhoneNumber',
        type: String,
        required: true
      },
      'Mother Phone Number': {
        prop: 'motherPhoneNumber',
        type: String
      },
      'Aadhaar No': {
        prop: 'aadhaarNo',
        type: String
      }
    }
    readXlsxFile(fileReaded, {schema}).then((data:any) => {
      if(data.rows){
        for (let i = 0; i < data.rows.length; i++) {
          const element = data.rows[i];
          this.studentBulkData.push(element);
        }
        console.log(this.studentBulkData);
      }
    });
  }

  onBulkSubmit(){
    for (let i = 0; i < this.studentBulkData.length; i++) {
      const element = this.studentBulkData[i];
      let createStudent: StudentDto = {
        studentName: element.studentName,
        admissionNo: element.admissionNo,
        fatherName: element.fatherName,
        motherName: element.motherName,
        classId: element.classId,
        sectionId: element.sectionId,
        dob: element.dob,
        admissionDate: element.admissionDate,
        addressType: element.addressType,
        urbanAddress: element.urbanAddress,
        villageAddress: element.villageAddress,
        postOffice: element.postOffice,
        policeStation: element.policeStation,
        districtName: element.districtName,
        gender: element.gender,
        religion: element.religion,
        castType: element.castType,
        fatherPhoneNumber: element.fatherPhoneNumber,
        motherPhoneNumber: element.motherPhoneNumber,
        aadhaarNo: element.aadhaarNo
      }
      let response = this.service.bulkUploadStudentData(createStudent);
    response.subscribe((data:any) => {
      console.log(data);
      if(data.result == "SUCCESS"){
       console.log("Success, Data saved");
       this.dismissModel();
      } else {
        Swal.fire("Sorry!", "Record not saved", 'info');
      }
      
    });
    }
    
    // console.log("Student Dto: ",createStudent);
    // console.log("Selected File: ", this.selectedFile);
    
  }

  pageChangeEvent(event) {
    this.p = event;
    console.log("Page: ", this.p);
    let studentData: StudentDto = {
      pageNumber: event - 1
      
    }
    let response = this.service.getFilteredStudents(studentData);
    response.subscribe((data:any) => {
      this.studentList = data["content"];
      this.pages = data["totalElements"];
      this.p = data["number"] +1;
      console.log(data);
    });
  }

}

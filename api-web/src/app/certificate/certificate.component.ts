import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ngxCsv } from 'ngx-csv';
import Swal from 'sweetalert2';
import { AuthguardService } from '../authguard.service';
import { CampusService } from '../campus.service';
import { CertificateDto, TeacherDto } from '../teachers/teacher.model';

@Component({
  selector: 'app-certificate',
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent implements OnInit {

  constructor(private modalService: NgbModal, private service: CampusService, private router: Router,
    private authService: AuthguardService) { }

  closeResult: string;
  message: string;
  data: any;
  authrequest:any = {
    "username": "admin",
    "password": "admin"
  }

  ngOnInit(): void {
    this.initializeCreateForm();
    this.initializeCriteriaForm();
    this.initializeFilterModel();
    this.initializeUpdateForm();
    this.initializeUploadForm();
    this.setDefaulltValue();
    this.viewAllCertificate();
    this.getAllTeachers();
    this.viewTopic();
  }

  selectedCertificate: CertificateDto;
  cFile: File;
  onEdit(updateContent: any, inService: CertificateDto) {
    this.selectedCertificate = inService;
    let tId = this.selectedCertificate.teacherId;
    console.log("Teacher ID: ", tId)
    console.log(this.selectedCertificate);
    this.updateCertificateForm.patchValue({
      uid: inService.id,
      utopic: inService.topic,
      utrainingdate: new Date(inService.trainingDate).toISOString().split('T')[0],
      utrainingtype: inService.trainingType,
      uorganization: inService.nameOfOrganization,
      uorganizationaddress: inService.organizationAddress,
      ucertificateno: inService.certificateNo,
      utraingduration: inService.noOfHours,
      uteacherid: inService.teacherId
    });
    this.cFile = inService.certificatePath;
    console.log(this.cFile);
    console.log(this.updateCertificateForm);
    this.modalService.open(updateContent, { ariaLabelledBy: 'modal-basic-title', size: 'lg', }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openFilterModel(createContenet: any) {
    this.filterCertificateForm.reset();
    this.initializeFilterModel();
    this.modalService.open(createContenet, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true, animation: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  open(createContent: any) {
    this.createCertificateForm.reset();
    this.setDefaulltValue();
    this.modalService.open(createContent, {
      ariaLabelledBy: 'modal-basic-title',
      size: 'lg', centered: true
    }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  openUpload(createContent: any) {
    this.uploadCertificateForm.reset();
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

  dismissModel() {
    this.modalService.dismissAll();
  }

  createCertificateForm: FormGroup;
  updateCertificateForm: FormGroup;
  certificateCriteriaForm: FormGroup;
  filterCertificateForm: FormGroup;
  uploadCertificateForm: FormGroup;
  initializeCreateForm() {
    this.createCertificateForm = new FormGroup({
      'certificatenumber': new FormControl(null, Validators.required),
      'topic': new FormControl(null, Validators.required),
      'trainingdate': new FormControl(null, Validators.required),
      'trainingtype': new FormControl(null, Validators.required),
      'organization': new FormControl(null, Validators.required),
      'organizationaddress': new FormControl(null, Validators.required),
      'traingduration': new FormControl(null, Validators.required),
      'teacherid': new FormControl(null, Validators.required),
      'teacherCert': new FormControl(null)
    });
  }
  initializeUpdateForm() {
    this.updateCertificateForm = new FormGroup({
      'uid': new FormControl(null),
      'ucertificateno': new FormControl(null, Validators.required),
      'utopic': new FormControl(null, Validators.required),
      'utrainingdate': new FormControl(null, Validators.required),
      'utrainingtype': new FormControl(null, Validators.required),
      'uorganization': new FormControl(null, Validators.required),
      'uorganizationaddress': new FormControl(null, Validators.required),
      'utraingduration': new FormControl(null, Validators.required),
      'uteacherid': new FormControl(null, Validators.required)
    });
  }
  initializeCriteriaForm() {
    this.certificateCriteriaForm = new FormGroup({
      'tfiltertype': new FormControl(null, Validators.required)
    });

    this.certificateCriteriaForm.patchValue({
      tfiltertype: ""
    });
  }

  initializeFilterModel() {
    this.filterCertificateForm = new FormGroup({
      'tfilteragency': new FormControl(null, Validators.required),
      'fstartdate': new FormControl(null, Validators.required),
      'fenddate': new FormControl(null, Validators.required),
      'tfiltertype': new FormControl(null, Validators.required),
      'fteachername': new FormControl(null, Validators.required),
      'ftraining': new FormControl(null, Validators.required),
      'pageNumber': new FormControl(null, Validators.required),
    });

    this.filterCertificateForm.patchValue({
      tfilteragency: "",
      fstartdate: "",
      fenddate: "",
      tfiltertype: "",
      fteachername: "",
      ftraining: "",
      pageNumber: 0
    });
  }
  initializeUploadForm() {
    this.uploadCertificateForm = new FormGroup({
      'ecertificateno': new FormControl(null, Validators.required),
      'etopic': new FormControl(null, Validators.required),
      'ecertificate': new FormControl(null, Validators.required),
    });
  }
  setDefaulltValue() {
    this.createCertificateForm.patchValue({
      id: null,
      topic: "",
      trainingdate: null,
      trainingtype: "",
      organization: "",
      organizationaddress: null,
      certificateno: null,
      traingduration: null,
      teacherid: ""
    });
  }

  certificates: CertificateDto[];
  viewAllCertificate() {
    let allCertificatedata: CertificateDto = {
      trainingType: "",      
      nameOfOrganization: "",
      topic: "",
      pageNumber: 0
    }
    let response = this.service.getFilteredCertficate(allCertificatedata);
    response.subscribe((data: any) => {
      this.certificates = data["content"];
      this.pages = new Array(data["totalPages"]);
      console.log(data);
      console.log(this.certificates);
    });
  }
  topicList: Set<String>;
  teachernamelist: Set<String>;
  viewTopic() {
    let allCertificatedata: CertificateDto = {
      trainingType: "",      
      nameOfOrganization: "",
      topic: "",
      pageNumber: 0

    }
    let response = this.service.getFilteredCertficate(allCertificatedata);
    response.subscribe((data: any) => {
      this.certificates = data["content"];
      console.log(this.certificates);
      this.topicList = new Set(this.certificates.map((item: any) => item.topic));
      this.teachernamelist = new Set(this.certificates.map((item: any) => item.teacher.teacherName));
      console.log(this.topicList);
      console.log("Teacher Name: ", this.teachernamelist);
    });
    // console.log("Topic list", this.topicList);

    // let newArray = new Set(this.certificates.map((item:any) => item.topic));
    // console.log(newArray);
  }

  selectedFile: File;
  onFileSelected(event) {

    this.selectedFile = event.target.files[0];
    let response = this.service.readFile(this.selectedFile);
    response.subscribe((data: any) => {
      this.selectedCertificate = data;
      console.log(this.selectedCertificate);
      this.createCertificateForm.patchValue({
        topic: this.selectedCertificate.topic,
        organizationaddress: this.selectedCertificate.organizationAddress,
        certificatenumber: this.selectedCertificate.certificateNo,
        trainingdate: new Date(this.selectedCertificate.trainingDate).toISOString().split('T')[0],
        // trainingdate: formatDate(dateString, "dd-mm-yyyy", 'en-US')
      });
      // console.log("Form Data: ", this.createCertificateForm.value);
    });
    console.log(this.selectedFile);
  }

  selectedFile2: File;
  onFileUpload(event) {

    this.selectedFile2 = event.target.files[0];
    console.log(this.selectedFile2);
  }

  teachers: TeacherDto[];
  getAllTeachers() {
    let response = this.service.getAllTeachers();
    response.subscribe((data: any) => {
      this.teachers = data;
      console.log(this.teachers);
    });
  }
  public viewTeacher(code: number){
    this.router.navigate(['/user-profile'], { queryParams: { teacherCode: code} });
  }

  public submitFilter() {
    let filterCertificate: CertificateDto = {
      trainingType: this.filterCertificateForm.value.tfiltertype,
      startDate: this.filterCertificateForm.value.fstartdate,
      endDate: this.filterCertificateForm.value.fenddate,
      nameOfOrganization: this.filterCertificateForm.value.tfilteragency,
      teacherId: this.filterCertificateForm.value.fteachername,
      topic: this.filterCertificateForm.value.ftraining,
      pageNumber: this.filterCertificateForm.value.pageNumber,

    }
    // console.log("Requested page no: ", this.filterCertificateForm.value.pageNumber);
    console.log(filterCertificate);
    let response = this.service.getFilteredCertficate(filterCertificate);
    response.subscribe((data: any) => {
      this.certificates = data["content"];
      this.pages = new Array(data["totalPages"]);
      console.log(this.certificates);
    });
    this.modalService.dismissAll();
  }
  pages: Array<number>;
  page: number;
  sendPageNo: number = 0;
  requestPage: number = 0;
  setPage(i, event) {
    event.preventDefault();
    this.filterCertificateForm.value.pageNumber = i;
    this.requestPage = this.filterCertificateForm.value.pageNumber;
    this.submitFilter();
  }

  public onSubmit() {
    console.log("Submit works");
    if (this.createCertificateForm.valid) {
      let createCertificate: CertificateDto = {
        topic: this.createCertificateForm.value.topic,
        trainingDate: this.createCertificateForm.value.trainingdate,
        noOfHours: this.createCertificateForm.value.traingduration,
        nameOfOrganization: this.createCertificateForm.value.organization,
        organizationAddress: this.createCertificateForm.value.organizationaddress,
        certificateNo: this.createCertificateForm.value.certificatenumber,
        trainingType: this.createCertificateForm.value.trainingtype,
        teacherId: this.createCertificateForm.value.teacherid,

      }

      console.log(createCertificate);
      let response = this.service.saveCertificate(createCertificate, this.selectedFile);
      response.subscribe((data: any) => {
        this.message = data.result;
        console.log(this.message);
        if (this.message == 'SUCCESS') {
          Swal.fire("Success", '', 'success');
          this.service.viewAllCertificate().subscribe((data: any) => this.certificates = data);
          this.modalService.dismissAll();
        } else {
          Swal.fire("Something went wrong", '', 'info');
        }

      });
    }
  }
  public onUpdate() {
    console.log("Submit works");
    if (this.updateCertificateForm.valid) {
      let updateCertificate: CertificateDto = {
        id: this.updateCertificateForm.value.uid,
        topic: this.updateCertificateForm.value.utopic,
        trainingDate: this.updateCertificateForm.value.utrainingdate,
        noOfHours: this.updateCertificateForm.value.utraingduration,
        nameOfOrganization: this.updateCertificateForm.value.uorganization,
        organizationAddress: this.updateCertificateForm.value.uorganizationaddress,
        certificateNo: this.updateCertificateForm.value.ucertificateno,
        trainingType: this.updateCertificateForm.value.utrainingtype,
        teacherId: this.updateCertificateForm.value.uteacherid,

      }

      console.log(updateCertificate);
      let response = this.service.updateCertificate(updateCertificate);
      response.subscribe((data: any) => {
        this.message = data.result;
        console.log(this.message);
        if (this.message == 'SUCCESS') {
          Swal.fire("Success", '', 'success');
          this.service.viewAllCertificate().subscribe((data: any) => this.certificates = data);
          this.modalService.dismissAll();
        } else {
          Swal.fire("Something went wrong", '', 'info');
        }

      });
    }
  }

  deleteCertificate(certificate: CertificateDto) {
    Swal.fire({
      title: 'Are you sure you want to delete the Certificate of ' + certificate.teacher.teacherName,
      color: '#000000',
      cancelButtonColor: '#716add',
      confirmButtonColor: '#f96332',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then((result) => {
      if (result.isConfirmed) {
        // your code for deletion, etc.
        let response = this.service.deleteCertificate(certificate.id);
        response.subscribe((data: any) => {
          this.message = data.result;
          console.log(this.message);
          if (this.message == 'SUCCESS') {
            this.certificates = this.certificates.filter(item => item.id != certificate.id);
            console.log("Deleted Certificate.");
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

  public results(){
    new ngxCsv(this.certificates, 'My Report');
  }

}

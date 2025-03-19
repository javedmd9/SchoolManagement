import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take, map, retry, shareReplay, first } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthguardService } from './authguard.service';
import { RoleguardGuard } from './roleguard.guard';
import { AuthRequestDto, Roles } from './security/AuthRequestDto.model';
import { AssignSubjectsTeacherDto, AttendanceDto, CertificateDto, ExamDateSheetDto, ExaminationDto, LeaveRequestDto, MarksDto, NewPrivilegeDto, OtherMarksDto, Privilege, PrivilegeDto, SchoolSession, StudentDocumentDto, StudentDto, StudentMarkDto, SubjectDto, TeacherDto, TempOtherMarkDto } from './teachers/teacher.model';
import { baseURL } from './constants';

@Injectable({
  providedIn: 'root'
})
export class CampusService {

  private baseUrl = baseURL.BASE_URL;

  constructor(private http: HttpClient, private service: AuthguardService, private roleService: RoleguardGuard) { }

  public getCampusList() {
    console.log(`getting list of campus from campus.service`)
    var abc = this.http.get(`${this.baseUrl}campus/view`);
    // console.log(abc);
    return abc;
  }

  public getFilteredCampus(campus) {
    return this.http.post(`${this.baseUrl}campus/filtered-campus`, campus);
  }

  public addCampus(campus) {
    return this.http.post(`${this.baseUrl}campus/add`, campus);
  }

  public deleteCampus(id: any) {
    return this.http.post(`${this.baseUrl}campus/delete`, id, { responseType: 'text' as 'json' });
  }

  public viewCampus(id: any) {
    return this.http.get(`${this.baseUrl}campus/edit/` + id);
  }

  public updateCampus(campus: any) {
    console.log(campus);
    return this.http.post(`${this.baseUrl}campus/update`, campus);
  }

  public getFacultyList() {
    // console.log(`getting list of faculty...`)
    return this.http.get(`${this.baseUrl}faculty/view`);
  }

  public getFilteredFaculty(faculty: any) {
    return this.http.post(`${this.baseUrl}faculty/filtered-faculty`, faculty);
  }

  public addFaculty(faculty: any) {
    return this.http.post(`${this.baseUrl}faculty/add`, faculty);
  }

  public deleteFaculty(id: any) {
    return this.http.post(`${this.baseUrl}faculty/delete`, id, { responseType: 'text' as 'json' });
  }

  public viewFaculty(id: any) {
    console.log(`Faculty ID: ` + id);
    return this.http.get(`${this.baseUrl}faculty/edit/` + id);
  }

  public updateFaculty(faculty: any) {
    console.log(faculty);
    return this.http.post(`${this.baseUrl}faculty/update`, faculty);
  }

  public facultyListByName() {
    return this.http.get(`${this.baseUrl}faculty/faculty-name`);
  }

  public addTeacher(modelData: TeacherDto, file: any) {
    let urlPath = `${this.baseUrl}teacher/add`;
    const mData = JSON.stringify(modelData);
    console.log(`MDATA: ` + mData);
    const formData = new FormData();
    formData.append('teacher', mData);
    if (file) {
      formData.append('file', file, file.name);
    }
    console.log(formData);
    return this.http.post(urlPath, formData);
  }

  public getTeacherCode() {
    return this.http.get(`${this.baseUrl}teacher/generate-new-teacher-code`);
  }

  public getAllTeachers() {
    return this.http.get(`${this.baseUrl}teacher/view`);
  }

  public deleteTeacher(id: TeacherDto) {
    return this.http.post(`${this.baseUrl}teacher/delete`, id);
  }

  public findTeacherByTeacherCode(code: number) {
    return this.http.post(`${this.baseUrl}teacher/find-by-code`, code);
  }

  public updateTeacherDto(teacher: TeacherDto) {
    return this.http.post(`${this.baseUrl}teacher/update`, teacher);
  }

  public updateTeacherPhoto(modelData: TeacherDto, file: File) {
    let urlPath = `${this.baseUrl}teacher/update-photo`;
    const mData = JSON.stringify(modelData);
    console.log(`MDATA: ` + mData);
    const formData = new FormData();
    formData.append('teacher', mData);
    if (file) {
      formData.append('file', file, file.name);
    }
    console.log(formData);
    return this.http.post(urlPath, formData);
  }

  public viewAllCertificate() {
    return this.http.get(`${this.baseUrl}certificate/view`);
  }

  public saveCertificate(cert: CertificateDto, file: File) {
    const mData = JSON.stringify(cert);
    console.log(`MDATA: ` + mData);
    const formData = new FormData();
    formData.append('dtoData', mData);
    if (file) {
      formData.append('file', file, file.name);
    }
    console.log(formData);
    return this.http.post(`${this.baseUrl}certificate/create`, formData);
  }

  public updateCertificate(cert: CertificateDto) {
    return this.http.post(`${this.baseUrl}certificate/update`, cert);
  }

  public deleteCertificate(cert: number) {
    return this.http.post(`${this.baseUrl}certificate/delete`, cert);
  }

  public readFile(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http.post(`${this.baseUrl}certificate/read-pdf`, formData);
  }

  public getFilteredCertficate(certificateDto: CertificateDto) {
    return this.http.post(`${this.baseUrl}certificate/filter-certificate`, certificateDto);
  }

  public createStudent(studentData: StudentDto, file: File) {
    const mData = JSON.stringify(studentData);
    console.log(`Student: ` + mData);
    const formData = new FormData();
    formData.append('student', mData);
    if (file) {
      formData.append('file', file, file.name);
    }
    console.log(formData);
    return this.http.post(`${this.baseUrl}student/add`, formData);
  }

  public deleteStudent(student: StudentDto) {
    return this.http.post(`${this.baseUrl}student/delete`, student);
  }

  public getFilteredStudents(studenDto: StudentDto) {
    return this.http.post(`${this.baseUrl}student/view`, studenDto);
  }

  public updateStudent(studenDto: StudentDto) {
    return this.http.post(`${this.baseUrl}student/update`, studenDto);
  }

  public approveStudent(studenDto: StudentDto) {
    return this.http.post(`${this.baseUrl}student/update-approve`, studenDto);
  }

  public rejectStudent(studenDto: StudentDto) {
    return this.http.post(`${this.baseUrl}student/update-reject`, studenDto);
  }

  public updateStudentPhoto(modelData: StudentDto, file: File) {
    let urlPath = '${this.baseUrl}student/update-photo';
    const mData = JSON.stringify(modelData);
    console.log(`MDATA: ` + mData);
    const formData = new FormData();
    formData.append('student', mData);
    if (file) {
      formData.append('file', file, file.name);
    }
    console.log(formData);
    return this.http.post(urlPath, formData);
  }

  public saveDocuments(modelData: StudentDocumentDto, files: File[]) {
    let urlPath = '${this.baseUrl}student/upload-documents';
    const mData = JSON.stringify(modelData);
    console.log(`mData: `, mData);

    const formData = new FormData();
    formData.append('dto', mData);
    // for (let i = 0; i < files.length; i++) {
    //   formData.append('files', files[i], files[i].name);
    // }
    if (files && files.length) {
      files.forEach(file => formData.append('files', file));
    }
    console.log(formData.getAll);
    return this.http.post(urlPath, formData);
  }

  public viewAllStudentDocuments(admissionNo: string) {
    return this.http.post(`${this.baseUrl}student/view-documents`, admissionNo);
  }

  public deleteStudentDocument(admissionNo: string, documentNo: string) {
    const formData = new FormData();
    formData.append('admissionNo', admissionNo);
    formData.append('documentNo', documentNo);
    return this.http.post(`${this.baseUrl}student/delete-document`, formData);
  }

  public findStudentById(id: number) {
    return this.http.post(`${this.baseUrl}student/find-by-id`, id);
  }

  public getAllRoles() {
    return this.http.get(`${this.baseUrl}roles/view`);
  }

  public createNewRole(roleDto: Roles) {
    return this.http.post(`${this.baseUrl}roles/create`, roleDto);
  }

  public getAllPrivilegeRoles(privilege: NewPrivilegeDto) {
    return this.http.post(`${this.baseUrl}privilege/view-privilege-role`, privilege);
  }

  public getAllPrivileges() {
    return this.http.get(`${this.baseUrl}privilege/view`);
  }

  public saveprivileges(privilegeId: PrivilegeDto) {
    return this.http.post(`${this.baseUrl}privilege/create-new-privilege`, privilegeId);
  }

  public findUserByUsername(username: string) {
    return this.http.get(`${this.baseUrl}admin/find-by-username?username=${username}`);
  }

  public saveAttendance(attendanceDto: AttendanceDto[]) {
    return this.http.post(`${this.baseUrl}attendance/create`, attendanceDto);
  }

  viewStudentAttendance(reqData: AttendanceDto) {
    return this.http.post(`${this.baseUrl}attendance/view`, reqData);
  }

  viewClassTeacher(teacherDto: TeacherDto) {
    return this.http.post(`${this.baseUrl}teacher/find-teacher-by-class-section`, teacherDto);
  }

  bulkUploadStudentData(studentData: StudentDto) {
    return this.http.post(`${this.baseUrl}student/bulk-upload`, studentData);
  }

  saveSubject(subjectDto: SubjectDto) {
    return this.http.post(`${this.baseUrl}subjects/create`, subjectDto);
  }

  viewAllSubjects() {
    return this.http.get(`${this.baseUrl}subjects/view`);
  }

  deleteSubject(subjectDto: SubjectDto) {
    return this.http.post(`${this.baseUrl}subjects/delete`, subjectDto);
  }

  findTeacherByRoles() {
    return this.http.get(`${this.baseUrl}teacher/find-teacher-by-roles`);
  }

  assignSubjectTeacher(assignSubjectDto: AssignSubjectsTeacherDto) {
    return this.http.post(`${this.baseUrl}assign-subject/create`, assignSubjectDto);
  }

  viewAllAssignedSubjectTeacher(pageNumber: number) {
    return this.http.post(`${this.baseUrl}assign-subject/view`, pageNumber);
  }

  deleteAssignedSubjectRecord(asignSubjectdto: AssignSubjectsTeacherDto) {
    return this.http.post(`${this.baseUrl}assign-subject/delete`, asignSubjectdto);
  }

  getClassListFromAssignedSubject() {
    return this.http.get(`${this.baseUrl}assign-subject/find-distinct-classes`);
  }

  viewAllDistinctSession() {
    return this.http.get(`${this.baseUrl}examination/find-all-session`);
  }

  createExamination(examDto: ExaminationDto) {
    return this.http.post(`${this.baseUrl}examination/create`, examDto);
  }

  getAllExamination(dto: ExaminationDto) {
    const url = `${this.baseUrl}examination/view`;
    return this.http.post(url, dto);
  }

  findDistinctSubjectsByClass(examDto: ExaminationDto) {
    return this.http.post(`${this.baseUrl}examination/find-exam-and-subject`, examDto);
  }

  customFilterExamination(examDto: ExaminationDto) {
    return this.http.post(`${this.baseUrl}examination/filtered-exam`, examDto);
  }

  public saveExamSchedule(modelData: ExamDateSheetDto) {
    let urlPath = `${this.baseUrl}exam-date-sheet/create`;
    const mData = JSON.stringify(modelData);
    // console.log(`mData: `, mData);

    const formData = new FormData();
    formData.append('dto', mData);

    // console.log(formData.getAll);
    return this.http.post(urlPath, formData);
  }

  getAllSchedule(dto: ExaminationDto) {
    return this.http.post(`${this.baseUrl}exam-date-sheet/view`, dto);
  }

  createPrivilege(privilegedto: Privilege) {
    return this.http.post(`${this.baseUrl}privilege/create`, privilegedto);
  }

  createSession(sessiondto: SchoolSession) {
    return this.http.post(`${this.baseUrl}session/create`, sessiondto);
  }

  viewAllSession() {
    return this.http.get(`${this.baseUrl}session/view`);
  }

  deleteSession(sessionDto: SchoolSession) {
    return this.http.post(`${this.baseUrl}session/delete`, sessionDto);
  }

  getCurrentSession() {
    return this.http.get(`${this.baseUrl}session/current-session`);
  }

  getAssignSubjectCustomSearch(assignSubjectDto: AssignSubjectsTeacherDto) {
    return this.http.post(`${this.baseUrl}assign-subject/filtered-subject-teacher`, assignSubjectDto);
  }

  addStudentMarks(modelData: MarksDto) {
    let urlPath = `${this.baseUrl}student-marks/create-marks`;
    const mData = JSON.stringify(modelData);
    // console.log(`mData: `, mData);

    const formData = new FormData();
    formData.append('dto', mData);

    // console.log(formData.getAll);
    return this.http.post(urlPath, formData);
  }

  viewAllDistinctClasses() {
    return this.http.get(`${this.baseUrl}assign-subject/find-distinct-class-and-section`);
  }

  viewAllSavedMarksRecord(marksDto: StudentMarkDto) {
    return this.http.post(`${this.baseUrl}student-marks/view`, marksDto);
  }

  deleteExamination(examDto: ExaminationDto) {
    return this.http.post(`${this.baseUrl}examination/delete`, examDto);
  }

  public findAllCurrentSessionExamByClass(classId: string) {
    const formData = new FormData();
    formData.append('classId', classId);
    return this.http.post(`${this.baseUrl}examination/get-all-examinations-by-class`, formData);
  }

  public getIndividualMarks(examData: StudentMarkDto) {
    return this.http.post(`${this.baseUrl}student-marks/student-exam-mark`, examData);
  }

  public deleteExamAndStudentMarkList(examData: any) {
    return this.http.post(`${this.baseUrl}exam-date-sheet/delete`, examData);
  }

  getAllFilteredBulkStudentMarks(marksDto: StudentMarkDto) {
    return this.http.post(`${this.baseUrl}student-marks/bulk-download`, marksDto);
  }

  findOtherMarksStudentList(dto: OtherMarksDto) {
    return this.http.post(`${this.baseUrl}other-marks/view-marks-by-exam-list`, dto);
  }

  saveStudentOtherMarks(dto: TempOtherMarkDto) {
    return this.http.post(`${this.baseUrl}other-marks/create`, dto);
  }

  viewAllStudentsOtherMarks() {
    return this.http.get(`${this.baseUrl}other-marks/view`);
  }

  autoSearchStudentName(sName: string) {
    return this.http.post(`${this.baseUrl}student-marks/find-student-by-name`, sName);
  }


  public submitLeaveApplication(dto: LeaveRequestDto) {
    return this.http.post(`${this.baseUrl}leave-request/create-student-leave`, dto);
  }

  getAllLeaveRequest(dto: LeaveRequestDto) {
    return this.http.post(`${this.baseUrl}leave-request/view-request`, dto);
  }

  viewStudentLeaveRequest(dto: LeaveRequestDto) {
    return this.http.post(`${this.baseUrl}leave-request/view-request-by-student`, dto);
  }

  approveStudentLeaveRequest(dto: LeaveRequestDto) {
    return this.http.post(`${this.baseUrl}leave-request/approve-student-leave`, dto);
  }

  rejectStudentLeaveRequest(dto: LeaveRequestDto) {
    return this.http.post(`${this.baseUrl}leave-request/reject-student-leave`, dto);
  }

  public saveTimeTable(dto: string) {
    let urlPath = `${this.baseUrl}time-table/create`;
    // console.log(formData.getAll);
    return this.http.post(urlPath, dto);
  }

  public viewClassTimeTable(dto: AssignSubjectsTeacherDto){
    return this.http.post(`${this.baseUrl}time-table/view`, dto);
  }

  public viewTeacherTimeTable(dto: AssignSubjectsTeacherDto){
    return this.http.post(`${this.baseUrl}time-table/view-teacher-time-table`, dto);
  }

  public saveOptionalSubjectTimeTable(dto: AssignSubjectsTeacherDto){
    return this.http.post(`${this.baseUrl}time-table/create-optional-period`, dto);
  }

  public getStudentPercentAndGrade(dto: StudentMarkDto) {
    return this.http.post(`${this.baseUrl}student-marks/student-grade`, dto);
  }

  public getExamScheduleByClass(classId: string){
    let url = `${this.baseUrl}exam-date-sheet/view-exam-date-sheet/${classId}`;
    return this.http.get(url);
  }

  public getSubjectListByClass(classId: string){
    let url = `${this.baseUrl}assign-subject/find-distinct-subjects-by-class/${classId}`;
    return this.http.get(url);
  }

  // Permission authentication system codes

  loggedInUserRole: Roles = new Roles();
  public getLoggedInUser(): AuthRequestDto {
    let userData: AuthRequestDto;
    this.service.user.pipe(
      shareReplay(),
      retry(1),
      take(1),
      map((data: any) => {
        console.log(`Got data from users pipe`);
        this.loggedInUserRole = data.roles;
        console.log(`Data: `, data);

      })
    )
    return userData;
  }

  permissionService(permissionArray: string[]) {
    // console.log(`Permission Array: `, permissionArray);
    let userData: AuthRequestDto;
    let privilegeList: Privilege[] = new Array();
    let permissionList: string[] = new Array();
    this.service.user.subscribe((data: any) => {
      userData = data;
      privilegeList = userData.privilegeList;
    });

    privilegeList.forEach(ele => {
      permissionList.push(ele.name);
    });
    // console.log(`Permission List: `, permissionList);
    const permissionMatch = permissionList.findIndex(ele => permissionArray.indexOf(ele) !== -1);
    return (permissionMatch < 0) ? false : true;
  }

  public fireSwalToast(data: any) {
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
      title: data
    });
  }

}

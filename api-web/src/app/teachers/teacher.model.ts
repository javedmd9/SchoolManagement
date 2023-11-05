export class TeacherDto {
    id?: number;
    teacherCode?: number;
    teacherName?: string;
    fatherName?: string;
    subjectAppointed?: string;
    taddress?: string;
    dob?: Date;
    post?: string;
    nappointment?: string;
    dateOfJoining?: Date;
    status?: string;
    teacherPhoto?: File;
    classId?: string;
    sectionId?: string;
    phoneNo?: string;
    email?: string;
    staffRole?: number;
    constructor(){}
}

export class CertificateDto {
    id?: number;
    topic: string;
    trainingDate?: Date;
    noOfHours?: number;
    nameOfOrganization: string;
    organizationAddress?: string;
    certificateNo?: string;
    certificatePath?: File;
    trainingType: string;
    teacherId?: number;
    teacher?: TeacherDto;
    trainingDateInString?: string;
    startDate?: Date;
    endDate?: Date;
    pageNumber?: number;
    teacherName?: string;
    constructor() { }
}

export class StudentDto {
    Id?: number;
    id?: number;
    studentName?: string;
    admissionNo?: string;
    fatherName?: string;
    motherName?: string;
    classId?: string;
    sectionId?: string;
    dob?: Date;
    admissionDate?: Date;
    addressType?: string;
    urbanAddress?: string;
    villageAddress?: string;
    postOffice?: string;
    policeStation?: string;
    districtName?: string;
    gender?: string;
    religion?: string;
    castType?: string;
    fatherPhoneNumber?: string;
    motherPhoneNumber?: string;
    aadhaarNo?: string;
    documentData?: string;
    studentPhoto?: string;
    updatedData?: string;
    rejectReason?: string;
    pageNumber?: number;
    constructor(){}
}

export class StudentDocumentDto{
    admissionNo?: string;
    documentData?: string;
    documentName?: string[];
    documentFile?: File[];
    documentFullPath?: string[];
    constructor(){}
}

export class Privilege {
    id?: number;
    name?: string;
    displayName?:string;
    selected?:boolean;
    constructor(){}
}

export class NewPrivilegeDto{
    roleId?: number;
    roleName?: string;
    privilegeList?: Privilege[];
    constructor(){}
}

export class PrivilegeDto {
    roleId: number;
    privilegeId: number[];
    constructor(){}
}

export class UserDto {
    userId: number;
    name: string;
    userType: string;
    teacherCode: number;
    constructor(){}
}

export class AttendanceDto {
    id?: number;
    attendanceDate?: Date;
    status?: string;
    admissionNo?: string;
    holidayName?: string;
    teacherId?: number;
    classId?: string;
    sectionId?: string;
    constructor() { }
}

export class AttendanceReport {
    studentDtoList?: StudentDto[];
    attendanceDate?: Date[];
    attendanceDtos?: AttendanceDto[];
    attendanceObject?: Object[];
    constructor() { }
}

export class SubjectDto{
    id?: number;
    subjectCode?: string;
    subjectName?: string;
    constructor(){}
}

export class AssignSubjectsTeacherDto{
    id?: number;
    teacherId?: number;
    subjectId?: number;
    classId?: string;
    sectionId?: string;
    teacherDto?: TeacherDto;
    subjectsDto?: SubjectDto;
    sessionName?: string;

    dayName?: string;
    periodNo?: number;
    constructor(){}
}

export class ExaminationDto{
    id?: number;
    sessionName?: string;
    examName?: string;
    classId?: string;
    examStartDate?: Date;
    examEndDate?: Date;
    subjectsDtoList?: SubjectDto[];
    examType?: string;
    constructor(){}
}

export class ExamDateSheetDto {
    id?: number;
    examId?: number;
    subjectId?: number;
    courseExamData?: string;
    constructor(){}
}

export class SchoolSession {
    id?: number;
    sessionName?: string;
    constructor(){}
}

export class MarksDto {
    sessionName: string;
    examName: string;
    classId: string;
    sectionId: string;
    examFullMarks: number;
    examSubject: string;
    studentMarksData: string;
    submittedById: Number;
    constructor(){}
}

export class StudentMarkDto {
    id?: number;
    sessionName?: string;
    examName?: string;
    classId?: string;
    sectionId?: string;
    subjectId?: number;
    submittedById?: number;
    admissionNo?: string;
    examination?: ExaminationDto;
    student?: StudentDto;
    subjects?: SubjectDto;
    teacher?: TeacherDto;
    pageNum?: number;
    examFullMarks?: number;
    obtainedMarks?: number;
    attendanceStatus?: string;
    examSubject?: string;
    studentName?: string;
    constructor(){}
}

export class ReportCardDto {
    examinationDtoList: ExaminationDto[];
    reportObject: Object[];
    constructor(){}
}

export class OtherMarksDto {
    sessionName?: string;
    subjectCode?: string;
    submittedById?: number;
    classId?: string;
    sectionId?: string;
    ptMarks?: number;
    subEnrich?: number;
    notebook?: number;
    examId?: number[];
    studentDto?: StudentDto;
    subjectDto?: SubjectDto;
    constructor(){}
}

export class TempOtherMarkDto {
    examinationId?: number;
    subjectCode?: string;
    studentData?: string;
    constructor(){}
}

export class LeaveRequestDto{
    id?: number;
    letterSubject?: string;
    letterBody?: string;
    submittedBy?: string;
    approvedBy?: string;
    approvedByName?: string;
    applicationDate?: Date;
    teacherDto?: TeacherDto;
    submittedById?: Map<number, string>;
    submittedByPersonName?: Map<string, string>;
    status?: string;
    roleName?: string;
    roleId?: number;
    pageNo?: number;
    constructor(){}
}

export class TimeTableDto {
    assignId?: number;
    monday?: number;
    tuesday?: number;
    wednesday?: number;
    thursday?: number;
    friday?: number;
    saturday?: number;
    constructor(){}
}

export class TimeTableReport {
    timeTableObject?: Object[];
    constructor(){}
}

export class StudentGradeDto {
    studentDto?: StudentDto;
    percentage?: number;
    grade?: string;
    examName?: string;
    constructor(){}
}
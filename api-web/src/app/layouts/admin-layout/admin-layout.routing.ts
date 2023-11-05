import { Routes } from '@angular/router';

import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { CreatecampaignComponent } from '../../createcampaign/createcampaign.component';
import { ManageadagencyComponent } from '../../manageadagency/manageadagency.component';
import { ManageusersComponent } from '../../manageusers/manageusers.component';
import { ViewusersComponent } from '../../viewusers/viewusers.component';
import { ViewadagencysComponent } from '../../viewadagencys/viewadagencys.component';
import { CreateCampusComponent } from '../../create-campus/create-campus.component';
import { ViewCampusComponent } from '../../view-campus/view-campus.component';
import { TeachersComponent } from '../../teachers/teachers.component';
import { CertificateComponent } from '../../certificate/certificate.component';
import { StudentComponent } from '../../student/student.component';
import { StudentProfileComponent } from '../../student-profile/student-profile.component';
import { SecurityComponent } from '../../security/security.component';
import { AuthGuard } from '../../auth.guard';
import { RoleguardGuard } from '../../roleguard.guard';
import { RolesPrivilegeComponent } from '../../roles-privilege/roles-privilege.component';
import { AttendanceComponent } from '../../attendance/attendance.component';
import { ClassSubjectComponent } from '../../class-subject/class-subject.component';
import { AssignSubjectComponent } from '../../assign-subject/assign-subject.component';
import { ExaminationComponent } from '../../examination/examination.component';
import { StudentMarksComponent } from '../../student-marks/student-marks.component';
import { OtherMarkComponent } from '../../other-mark/other-mark.component';
import { LeaveRequestComponent } from '../../leave-request/leave-request.component';
import { TimeTableComponent } from '../../time-table/time-table.component';

export const AdminLayoutRoutes: Routes = [
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'security', component: SecurityComponent },
    { path: 'create-campus', component: CreateCampusComponent },
    { path: 'view-campus', component: ViewCampusComponent},
    { path: 'view-certificate', component: CertificateComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['SHOW CERTIFICATE PAGE'] } },
    { path: 'roles-privilege', component: RolesPrivilegeComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['SHOW PRIVILEGE PAGE'] } },
    { path: 'teacher',   component: TeachersComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['SHOW TEACHER PAGE'] } },
    { path: 'student',   component: StudentComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['SHOW STUDENT PAGE'] } },
    { path: 'student-profile',   component: StudentProfileComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW STUDENT PROFILE'] } },
    { path: 'user-profile',   component: UserProfileComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW TEACHER PROFILE'] } },
    { path: 'attendance',  component: AttendanceComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['SHOW ATTENDANCE PAGE'] } },
    { path: 'class-subject',  component: ClassSubjectComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW SUBJECT PAGE'] } },
    { path: 'assign-subject',  component: AssignSubjectComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW ASSIGN SUBJECT PAGE'] } },
    { path: 'examination',  component: ExaminationComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW EXAMINATION PAGE'] } },
    { path: 'student-marks',  component: StudentMarksComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW STUDENT MARKS'] } },
    { path: 'other-mark',  component: OtherMarkComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW OTHER MARKS'] } },
    { path: 'leave-request',  component: LeaveRequestComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW LEAVE REQUEST'] } },
    { path: 'time-table',  component: TimeTableComponent, canActivate: [AuthGuard, RoleguardGuard], data: { expectedRoles: ['VIEW LEAVE REQUEST'] } },
    { path: 'manage-campaign',     component: TableListComponent },
    { path: 'help',     component: TypographyComponent },
    { path: 'icons',          component: IconsComponent },
    { path: 'notifications',  component: NotificationsComponent },
    { path: 'create-adagency',  component: ManageadagencyComponent },
    { path: 'manage-adagency',  component: ViewadagencysComponent },
    // { path: 'faculty',   component: FacultyComponent },
    { path: 'create-users',  component: ManageusersComponent },
    { path: 'manage-users',  component: ViewusersComponent },
];

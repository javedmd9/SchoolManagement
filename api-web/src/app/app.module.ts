import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app.routing';
import { ComponentsModule } from './components/components.module';

import { AppComponent } from './app.component';

import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { ManageadagencyComponent } from './manageadagency/manageadagency.component';
import { ManageusersComponent } from './manageusers/manageusers.component';
import { ViewusersComponent } from './viewusers/viewusers.component';
import { ViewadagencysComponent } from './viewadagencys/viewadagencys.component';
import { CreateCampusComponent } from './create-campus/create-campus.component';
import { ViewCampusComponent } from './view-campus/view-campus.component';
import { CampusService } from './campus.service';
import { FacultyComponent } from './faculty/faculty.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { CustompaginationComponent } from './custompagination/custompagination.component';
import { TeachersComponent } from './teachers/teachers.component';
import { AngularFileUploaderModule } from 'angular-file-uploader';
import { CertificateComponent } from './certificate/certificate.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { StudentComponent } from './student/student.component';
import { StudentProfileComponent } from './student-profile/student-profile.component';
import { SecurityComponent } from './security/security.component';
import { AuthGuard } from './auth.guard';
import { AuthInterceptor } from './security/auth.interceptor';
import { RolesPrivilegeComponent } from './roles-privilege/roles-privilege.component';
import { AttendanceComponent } from './attendance/attendance.component';
import { ClassSubjectComponent } from './class-subject/class-subject.component';
import { AssignSubjectComponent } from './assign-subject/assign-subject.component';
import { ExaminationComponent } from './examination/examination.component';
import { StudentMarksComponent } from './student-marks/student-marks.component';
import { OtherMarkComponent } from './other-mark/other-mark.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { LeaveRequestComponent } from './leave-request/leave-request.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { TimeTableComponent } from './time-table/time-table.component';
import { NgxPrintModule } from 'ngx-print';
import { NgxCaptureModule } from 'ngx-capture';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    ComponentsModule,
    RouterModule,
    ReactiveFormsModule,
    AngularFileUploaderModule,
    AppRoutingModule,
    NgxPaginationModule,
    Ng2SearchPipeModule,
    NgbModule,
    NgxPrintModule,
    NgxCaptureModule,
    ToastrModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot()
  ],
  declarations: [
    AppComponent,
    AdminLayoutComponent,
    CreateCampusComponent,
    ViewCampusComponent,
    FacultyComponent,
    CustompaginationComponent,
    TeachersComponent,
    CertificateComponent,
    StudentComponent,
    StudentProfileComponent,
    SecurityComponent,
    RolesPrivilegeComponent,
    AttendanceComponent,
    ClassSubjectComponent,
    AssignSubjectComponent,
    ExaminationComponent,
    StudentMarksComponent,
    OtherMarkComponent,
    LeaveRequestComponent,
    UserProfileComponent,
    TimeTableComponent
  
  ],
  providers: [CampusService, AuthGuard, 
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

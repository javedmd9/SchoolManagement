import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AdminLayoutRoutes } from './admin-layout.routing';
import { DashboardComponent } from '../../dashboard/dashboard.component';
import { UserProfileComponent } from '../../user-profile/user-profile.component';
import { TableListComponent } from '../../table-list/table-list.component';
import { TypographyComponent } from '../../typography/typography.component';
import { IconsComponent } from '../../icons/icons.component';
import { NotificationsComponent } from '../../notifications/notifications.component';
import { ChartsModule } from 'ng2-charts';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { CreatecampaignComponent } from '../../createcampaign/createcampaign.component';
import { ManageadagencyComponent } from '../../manageadagency/manageadagency.component';
import { ManageusersComponent } from '../../manageusers/manageusers.component';
import { ViewadagencysComponent } from '../../viewadagencys/viewadagencys.component';
import { ViewusersComponent } from '../../viewusers/viewusers.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    ChartsModule,
    NgbModule,
    ToastrModule.forRoot()
  ],
  declarations: [
    DashboardComponent,
    TableListComponent,
    TypographyComponent,
    IconsComponent,
    NotificationsComponent,
    CreatecampaignComponent,
    ManageadagencyComponent,
    ManageusersComponent,
    ViewadagencysComponent,
    ViewusersComponent
  ]
})

export class AdminLayoutModule {}

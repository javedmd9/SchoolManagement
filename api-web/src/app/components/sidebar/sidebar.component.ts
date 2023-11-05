import { Component, OnInit } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { AuthguardService } from '../../authguard.service';
import { CampusService } from '../../campus.service';

declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    permission?: string;
}
export const ROUTES: RouteInfo[] = [
    { path: '/dashboard', title: 'Dashboard',  icon: 'design_app', class: '' },
    // { path: '/security', title: 'Login',  icon: 'design_app', class: '' },
    { path: '/view-certificate', title: 'View Certificate',  icon:'education_agenda-bookmark', class: '', permission: 'SHOW CERTIFICATE PAGE' },
    { path: '/teacher', title: 'View Teachers',  icon:'users_single-02', class: '', permission: 'SHOW TEACHER PAGE' },
    { path: '/student', title: 'View Students',  icon:'users_single-02', class: '', permission: 'SHOW STUDENT PAGE' },
    { path: '/attendance', title: 'Attendance',  icon:'files_single-copy-04', class: '', permission: 'SHOW ATTENDANCE PAGE' },
    { path: '/create-users', title: 'Create User',  icon:'users_circle-08', class: '', permission: '' },
    { path: '/roles-privilege', title: 'Assign Privileges',  icon:'ui-1_lock-circle-open', class: '', permission: 'SHOW PRIVILEGE PAGE' },
    { path: '/class-subject', title: 'Class Subject',  icon:'users_circle-08', class: '', permission: 'VIEW SUBJECT PAGE' },
    { path: '/assign-subject', title: 'Assign Subject',  icon:'users_circle-08', class: '', permission: 'VIEW ASSIGN SUBJECT PAGE' },
    { path: '/examination', title: 'Examination',  icon:'education_agenda-bookmark', class: '', permission: 'VIEW EXAMINATION PAGE' },
    { path: '/student-marks', title: 'Student Marks',  icon:'education_hat', class: '', permission: 'VIEW STUDENT MARKS' },
    { path: '/other-mark', title: 'Other Marks',  icon:'education_hat', class: '', permission: 'VIEW OTHER MARKS' },
    { path: '/leave-request', title: 'Leave Request',  icon:'ui-1_email-85', class: '', permission: 'VIEW LEAVE REQUEST' },
    { path: '/time-table', title: 'Time Table',  icon:'ui-1_calendar-60', class: '', permission: 'VIEW TIME TABLE' },
    // { path: '/student-profile', title: 'Student Profile',  icon:'users_circle-08', class: '' },
    { path: '/help', title: 'Help',  icon:'text_caps-small', class: '' },
    { path: '/icons', title: 'Icons',  icon:'education_atom', class: '', permission: 'VIEW STUDENT MARKS' },
    // { path: '/notifications', title: 'Notifications',  icon:'ui-1_bell-53', class: '' },

    // { path: '/create-campus', title: 'Create Campus',  icon:'users_single-02', class: '' },
    // { path: '/view-campus', title: 'View Campus',  icon:'users_single-02', class: '' },
    
    // { path: '/faculty', title: 'View Faculty',  icon:'users_single-02', class: '' },
    
    // { path: '/create-campaign', title: 'Create Campaign',  icon:'users_single-02', class: '' },
    // { path: '/manage-campaign', title: 'Manage Campaigns',  icon:'design_bullet-list-67', class: '' },
    
    // { path: '/user-profile', title: 'User Profile',  icon:'users_circle-08', class: '' },
    // { path: '/create-adagency', title: 'Create Ad Agency',  icon:'users_circle-08', class: '' },
    // { path: '/manage-adagency', title: 'Manage Ad Agency',  icon:'design_bullet-list-67', class: '' },
    
    // { path: '/manage-users', title: 'Manage Users',  icon:'design_bullet-list-67', class: '' }

];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  menuItems: any[] = [];
  subscribeMenu: Subscription;
  constructor(private service?: CampusService, private authService?: AuthguardService) { }

  ngOnInit() {
    
    const validateLogin = interval(1000);
    this.subscribeMenu = validateLogin.subscribe(res => {
      console.log("Interval: ",res);
      if(this.authService.isLoggedIn){
        this.writeSideBarMenu();
        this.subscribeMenu.unsubscribe()
      }
    });
    
    // this.menuItems = ROUTES.filter(menuItem => menuItem);
  }
  
  private writeSideBarMenu() {
    return this.menuItems = ROUTES.filter(menuItem => {
      if (this.service.permissionService([menuItem.permission]) == true) {
        // console.log("Menu items: ", menuItem);
        return menuItem;
      }
    });
  }

  isMobileMenu() {
      if ( window.innerWidth > 991) {
          return false;
      }
      return true;
  };
}

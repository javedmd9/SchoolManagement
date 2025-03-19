import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { AuthguardService } from './authguard.service';
import { AuthRequestDto, Roles } from './security/AuthRequestDto.model';
import { Privilege } from './teachers/teacher.model';

@Injectable({
  providedIn: 'root'
})
export class RoleguardGuard implements CanActivate {

  constructor(private service:AuthguardService){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.isAuthorised(route);
  }

  role = new BehaviorSubject<Roles>(null);
  isAuthorised2(route: ActivatedRouteSnapshot){
    let roles:string[] = new Array();
    this.service.user.pipe(first())
    .subscribe((data:any) => {
      console.log("All data: ", data);
      roles.push(data.roles.name);
    });
    console.log("ROLES: ", roles);
    const expectedRoles = route.data.expectedRoles;
    console.log("Expected Roles: ", expectedRoles);
    const roleMatch = roles.findIndex(ele => expectedRoles.indexOf(ele) !== -1);
    return (roleMatch < 0) ? false: true;
  }

  isAuthorised(route: ActivatedRouteSnapshot) {
    let userData: AuthRequestDto;
    let privilegeList: Privilege[] = new Array();
    let permissionList: string[] = new Array();
    this.service.user.subscribe((data:any) => {
      userData = data;
      privilegeList = userData.privilegeList;
    });
    if(userData?.roles?.name == "SUPER ADMIN") return true;
    const expectedPermission = route.data.expectedRoles;
    console.log("Expected Permissions: ", expectedPermission);
    privilegeList.forEach(ele => {
      permissionList.push(ele.name);
    });
    console.log("Permission List: ", permissionList);
    const permissionMatch = permissionList.findIndex(ele => expectedPermission.indexOf(ele) !== -1);
    return (permissionMatch < 0) ? false : true;
  }
  
}

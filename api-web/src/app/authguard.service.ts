import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { tap } from 'rxjs/operators';
import { Privilege } from './teachers/teacher.model';
import { AuthRequestDto, Roles } from './security/AuthRequestDto.model';
import { baseURL } from './constants';

@Injectable({
  providedIn: 'root'
})
export class AuthguardService {

  base_URL: string = baseURL.BASE_URL;

  constructor(private http: HttpClient) {
    this.autoSignIn();
  }

  isLoggedIn: boolean = false;
  user = new BehaviorSubject<AuthRequestDto>(null);
  private authenticatedUser(username: string, password: string, token: string, expiryTime: Date, roles: Roles, privilegeList: Privilege[]) {
    const userData = new AuthRequestDto(username, password, token, expiryTime, roles, privilegeList);
    console.log(`Calling authenticate user func: `, userData.tokenExpiry);

    if (userData) {
      console.log(`Storing data in USER`);
      
      this.user.next(userData);
      this.autoSignOut(this.getExpirationTime(userData.tokenExpiry));
      console.log(`In auth service page: `,this.user.value._token);
      localStorage.setItem(`UserData`, JSON.stringify(userData));
      this.isLoggedIn = true;
    }


  }

  public authRequestDto: AuthRequestDto;
  roleId: number;

  public generateToken(request) {
    return this.http.post<AuthRequestDto>(`${this.base_URL}admin/authentication`, request, { responseType: 'text' as 'json' }).pipe(
      tap(((res: any) => {
        // console.log(`result`,res);
        this.authRequestDto = JSON.parse(res);
        this.authenticatedUser(this.authRequestDto.username, this.authRequestDto.password, this.authRequestDto.token, 
          new Date(this.authRequestDto.tokenExpiry), this.authRequestDto.roles, this.authRequestDto.privilegeList);
        this.roleId = this.authRequestDto.roles.id;
        console.log(`Saving role Id`, this.roleId);
        
        console.log(`Auth guard page`, this.authRequestDto);

      }))
    )
  }

  public autoSignIn() {
    const userData = JSON.parse(localStorage.getItem(`UserData`));
    // console.log(`Auto Sign in User Data:`, userData);

    if (!userData) {
      console.log(`User Data not found in local storage`);

      return
    }
    const loggedInUser = new AuthRequestDto(userData.username, userData.password, userData._token, userData.tokenExpiry, userData.roles, userData.privilegeList);
    // console.log(`Auto Sign in User Data2:`, loggedInUser);

    if (!loggedInUser.tokenExpiry || new Date() > new Date(loggedInUser.tokenExpiry)) {
      console.log(`Token Expired`);
      localStorage.setItem(``,``);
    } else {
      let date1: Date;
      let date2: Date;
      date1 = new Date();
      date2 = new Date(loggedInUser.tokenExpiry);
      var diff = date2.getTime() - date1.getTime();
      console.log(`Time will expire in : `, diff);
      this.isLoggedIn = true;
      this.user.next(loggedInUser);
      this.roleId = loggedInUser.roles.id;
      this.autoSignOut(diff);
      console.log(`Auto signin User Data: `, this.user);
    }

    if (loggedInUser.token) {
      
    }


  }

  autoSignOut(tokenExpiryDuration:number){
    setTimeout(() => {
      this.user.next(null);
      localStorage.removeItem(`UserData`);
    }, tokenExpiryDuration);
  }

  getExpirationTime(time:any){
    let date1: Date;
      let date2: Date;
      date1 = new Date();
      date2 = new Date(time);
      var diff = date2.getTime() - date1.getTime();
      console.log(`Time will expire in : `, diff);
      return diff;
  }

  // public welcomeToken(token:string){
  //   let tokenStr = `Bearer ` + token;
  //   const headers = new HttpHeaders().set(`Authorization`, tokenStr);
  //   return this.http.get(`http://localhost:9009/admin/login`,{headers, responseType:'text' as 'json'});
  // }

}

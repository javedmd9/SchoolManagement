import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthguardService } from '../authguard.service';
import { CampusService } from '../campus.service';
import { AuthRequestDto } from './AuthRequestDto.model';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css']
})
export class SecurityComponent implements OnInit {

  constructor(private service: AuthguardService, private router: Router, private authService: CampusService) { }

  credentials = { username: '', password: '' };
  authRequestDto: AuthRequestDto;
  
  login() {
    if (this.credentials.username != null && this.credentials.password != null) {
      let response = this.service.generateToken(this.credentials);
      response.subscribe((data:any) => {
        this.authRequestDto = JSON.parse(data);
        console.log("Login Page data: ",this.authRequestDto);
        if(this.authRequestDto.roles.name == "SUPER ADMIN"){
          this.router.navigate(['/dashboard']);
        } else if(this.authRequestDto.roles.name != "SUPER ADMIN" && this.authRequestDto.roles.name != "STUDENT"){
          let response = this.authService.findUserByUsername(this.authRequestDto.username);
          let code: number;
          response.subscribe((data:any) => {
            code = data.teacherCode;
            this.router.navigate(['/user-profile'], { queryParams: { teacherCode: code} });
          });
        } else if(this.authRequestDto.roles.name == "STUDENT") {
          let response = this.authService.findUserByUsername(this.authRequestDto.username);
          let code: number;
          response.subscribe((data:any) => {
            code = data.userId;
            console.log("Got Student code: ", code);
            this.router.navigate(['/student-profile'], { queryParams: { admissionNo: code} });
          });
        } else {
          this.router.navigate(['/dashboard']);
        }
        
      });
    }
  }

  ngOnInit(): void {
    
  }

  // getToken:string;
  // public getAccessToken(){
  //   let response = this.service.generateToken(this.authrequest);
  //   response.subscribe((data:any) => {
  //     console.log(data);
  //     this.getToken = data;
  //     this.accessToken();
  //   });
  // }

  // public accessToken(){
  //   let response = this.service.welcomeToken(this.getToken);
  //   response.subscribe((data:any) => {
  //     console.log(data);
  //     // this.getToken = data;
  //     return data;
  //   });
  // }

}

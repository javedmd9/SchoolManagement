import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { take, map, retry, shareReplay } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthguardService } from './authguard.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private service: AuthguardService, private router: Router){}
  
  canActivate() {
    return this.service.user.pipe(
      shareReplay(),
      retry(1),
      take(1),
      map((user:any) => {
        console.log("Can Activate: ", user);
        if(user != null){
          if(user._token == null){
            Swal.fire("Retry!","Invalid username or password", 'info');
            return this.router.createUrlTree(['/security']);
          }
          if(new Date() > new Date(user.tokenExpiry)){
            // console.log("Token expired need to login again.");
            Swal.fire("Session Expired!","Please login again", 'info');
            return this.router.createUrlTree(['/security']);
          }
        }
        
        if(user){
          return true;
        }
        
        Swal.fire("Session Expired!","Please login again", 'info');
        return this.router.createUrlTree(['/security']);
      })
    )
  }

  isLoggedIn(){
    
  }
}

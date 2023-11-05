import { HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { exhaustMap, retry, shareReplay, take } from "rxjs/operators";
import Swal from "sweetalert2";
import { AuthguardService } from "../authguard.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private authService: AuthguardService, private router: Router) { }
    intercept(req: HttpRequest<any>, next: HttpHandler) {

        return this.authService.user.pipe(shareReplay(), take(1), exhaustMap((data: any) => {

            if (!data) {
                console.log("User => ", data);
                this.router.navigate(['/security']);
                return next.handle(req);
            }
            if (data) {
                let tokenStr = "Bearer " + data.token;
                const modifiedRequest = req.clone({
                    headers: new HttpHeaders().set("Authorization", tokenStr)
                    
                });
                console.log("Sending request to backend: ", data);
                return next.handle(modifiedRequest);
            }
        }))

    }

}
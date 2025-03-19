import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import Swal from "sweetalert2";


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    constructor(private router: Router) { }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {

                console.log("Error Interceptor error: ", error);

                if (error.status === 401 || error.status === 403) {
                    console.log("Redirecting to login: ", error.status);
                    localStorage.removeItem('authdetail');
                    error.error.message = "Token expired. Please login again.";
                    this.router.navigate(['']);
                }

                if (error.error) {
                    Swal.fire('Failed', error.error, 'error');
                } else {
                    Swal.fire('Failed', error.error?.message, 'error');
                }

                // console.log("Error Interceptor error1: ", error.error);
                // console.log("Error Interceptor error2: ", error.error?.message);
                //alert(errorMessage); // Optionally show an alert or handle it differently
                return throwError(() => new Error(error.error));
            })
        );
    }

}
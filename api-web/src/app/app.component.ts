import { Component, OnInit} from '@angular/core';
import { AuthguardService } from './authguard.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private authService: AuthguardService){}
  ngOnInit(): void {
    this.authService.autoSignIn();
  }

}

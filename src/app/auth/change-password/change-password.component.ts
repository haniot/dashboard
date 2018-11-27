import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '../../../../node_modules/@angular/router';
import { Validators, FormBuilder, FormGroup } from '../../../../node_modules/@angular/forms';
import { AuthService } from '../services/auth.service';
import { HttpErrorResponse } from '../../../../node_modules/@angular/common/http';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {


  f: FormGroup;
  errorCredentials = false;
  redirect_link;

  constructor(private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    $('body').css('background-color', '#00a594')
    console.log()
    this.f = this.formBuilder.group({
      old_password: [null, [Validators.required]],
      new_password: [null, [Validators.required]]
    });


    this.route
      .queryParams
      .subscribe(params => {
        this.redirect_link = params['redirect_link'];
      });
  }

  onSubmit() {
    console.log('redirect_link', this.redirect_link)
    this.authService.changePassowrd(this.f.value, this.redirect_link).subscribe(
      (resp) => {
        this.router.navigate(['']);
      },
      (errorResponse: HttpErrorResponse) => {
        if (errorResponse.status === 401) {
          this.errorCredentials = true;
        }
      }
    );
  }

}
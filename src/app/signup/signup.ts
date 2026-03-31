import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

declare const google: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.html',
  styleUrls: ['./signup.css'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, CommonModule]
})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {

    this.signupForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });

  }

  // ✅ Password match validator
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirm = form.get('confirmPassword')?.value;
    return password === confirm ? null : { mismatch: true };
  }

  // ✅ Normal signup
  onSignup() {
    if (this.signupForm.invalid) return;

    const { confirmPassword, ...data } = this.signupForm.value;

    this.http.post('http://localhost:8080/api/auth/signup', data)
      .subscribe({
        next: () => {
          alert("Account created successfully 🎉");
          this.router.navigate(['/signin']);
        },
        error: (err) => {
          console.error(err);
          alert("Error creating account ❌");
        }
      });
  }

  // ✅ Google login/signup
  handleGoogleLogin(response: any) {
    const token = response.credential;

    this.http.post('http://localhost:8080/api/auth/google', { token })
      .subscribe({
        next: (user: any) => {
          console.log("Google user:", user);

          localStorage.setItem("user", JSON.stringify(user));

          this.router.navigate(['/signin']);
        },
        error: err => console.error(err)
      });
  }

  // ✅ Google init
ngOnInit() {
  this.loadGoogle();
}

loadGoogle() {
  const interval = setInterval(() => {
    if ((window as any).google) {
      clearInterval(interval);
      this.initGoogle();
    }
  }, 100);
}

initGoogle() {
  (window as any).google.accounts.id.initialize({
    client_id: "916063918690-s8cbj6noetc20l7t0kfev2ep0c8pi88e.apps.googleusercontent.com",
    callback: (response: any) => this.handleGoogleLogin(response) // ✅ FIXED
  });

  (window as any).google.accounts.id.renderButton(
    document.getElementById("googleBtn"),
    {
      theme: "outline",
      size: "large",
      width: 250
    }
  );
}
}
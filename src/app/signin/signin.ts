import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

declare const google: any;

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './signin.html'
})
export class SigninComponent implements OnInit {

  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  // ---------------- LOGIN ----------------
  onLogin() {
    if (this.loginForm.valid) {
      this.http.post<any>('http://localhost:8080/api/auth/signin', this.loginForm.value)
        .subscribe({
          next: (res) => {

            if (!res || !res.token) {
              alert("Invalid credentials ❌");
              return;
            }

            console.log("Login response:", res);

            // ✅ store token
            localStorage.setItem("token", res.token);

            // ✅ store user info (optional)
            localStorage.setItem("user", JSON.stringify(res));

            // ✅ role is STRING now
            if (res.role === "ADMIN") {
              this.router.navigate(['/AdminDashboard']);
            } else {
              this.router.navigate(['/home']);
            }
          },

          error: () => {
            alert("Invalid credentials ❌");
          }
        });
    }
  }

  // ---------------- GOOGLE LOGIN ----------------
  handleGoogleLogin(response: any) {
    const token = response.credential;

    this.http.post<any>('http://localhost:8080/api/auth/google', { token })
      .subscribe({
        next: (res) => {

          console.log("Google user:", res);

          // ✅ store token
          localStorage.setItem("token", res.token);

          // ✅ store user info
          localStorage.setItem("user", JSON.stringify(res));

          // ✅ FIXED role check
          if (res.role === "ADMIN") {
            this.router.navigate(['/AdminDashboard']);
          } else {
            this.router.navigate(['/chat']);
          }
        },

        error: (err) => {
          console.error(err);
        }
      });
  }

  // ---------------- INIT ----------------
  ngOnInit(): void {
  if (!(window as any).googleInitialized) {
    google.accounts.id.initialize({
      client_id: '916063918690-s8cbj6noetc20l7t0kfev2ep0c8pi88e.apps.googleusercontent.com',
      callback: (response: any) => this.handleGoogleLogin(response)
    });

    (window as any).googleInitialized = true;
  }

  google.accounts.id.renderButton(
    document.getElementById("googleBtn"),
    {
      theme: "outline",
      size: "large",
      width: "250"
    }
  );
}
}
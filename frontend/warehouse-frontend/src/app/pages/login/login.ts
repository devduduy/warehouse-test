import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['programmer@da', [Validators.required, Validators.email]],
    password: ['Prog123!', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
  
    this.loading = true;
    this.error = '';
  
    const email = this.form.value.email!;
    const password = this.form.value.password!;
  
    this.auth
      .login(email, password)
      .pipe(
        finalize(() => {
          this.loading = false;
        })
      )
      .subscribe({
        next: (res) => {
          if (res?.statusCode !== 1) {
            this.error = res?.message ?? 'Login gagal';
            return;
          }
  
          this.router.navigate(['/items']).then(() => {
          });
        },
        error: (err) => {
          console.error('LOGIN ERROR:', err);
          this.error = 'Login error (cek console)';
        },
      });
  }
}

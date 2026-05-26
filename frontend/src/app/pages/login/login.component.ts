import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { extractApiErrorPayload } from '../../core/utils/api-error.util';
import {
  EXTERNAL_DOMAIN_LINKS,
  resolveExternalLinkUrl,
} from '../../config/external-domains.config';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    this.errorMessage = '';

    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (res) => {
        const externalLinkName =
          this.route.snapshot.queryParamMap.get('externalLink');
        const externalLink = EXTERNAL_DOMAIN_LINKS.find(
          (link) => link.name === externalLinkName,
        );
        if (externalLink) {
          window.location.assign(
            resolveExternalLinkUrl(externalLink, res.token),
          );
          return;
        }

        this.router.navigate(['']);
      },
      error: (err) => {
        const apiError = extractApiErrorPayload(err);
        this.errorMessage =
          apiError?.code === 'AUTH_FAILED'
            ? 'Login failed. Please check your username and password.'
            : apiError?.code === 'VALIDATION_ERROR'
              ? 'Please enter both username and password.'
              : apiError?.code === 'RATE_LIMITED'
                ? 'Too many attempts. Please try again later.'
                : apiError?.message ||
                  'Login failed. Please check your username and password.';
        console.error('Login error:', err);
      },
    });
  }
}

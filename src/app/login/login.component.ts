import { Component, NgZone } from '@angular/core'; // <--- Import NgZone
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  empId: string = '';
  password: string = '';
  isLoading: boolean = false;
  errorMessage: string = '';
  isShaking: boolean = false;

  constructor(
    private auth: AuthService, 
    private router: Router,
    private zone: NgZone // <--- Inject Zone
  ) {}

  onLogin() {
    if (!this.empId || !this.password) {
      this.errorMessage = 'Please enter both ID and Password';
      this.shakeForm();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    console.log('Attempting Login for:', this.empId);

    this.auth.login(this.empId, this.password).subscribe({
      next: (response: any) => {
        console.log('Login API Response:', response);
        this.isLoading = false;
        
        if (response.d.Success) {
          console.log('Success! Navigating to Dashboard...');
          
          // --- FORCE NAVIGATION ---
          this.zone.run(() => {
             this.router.navigate(['/dashboard']);
          });

        } else {
          console.warn('Login Failed:', response.d.Message);
          this.errorMessage = response.d.Message || 'Invalid Credentials';
          this.shakeForm();
        }
      },
      error: (err) => {
        console.error('Login Error:', err);
        this.isLoading = false;
        this.errorMessage = 'Server Error. Check Console.';
      }
    });
  }

  shakeForm() {
    this.isShaking = true;
    setTimeout(() => this.isShaking = false, 500);
  }
}
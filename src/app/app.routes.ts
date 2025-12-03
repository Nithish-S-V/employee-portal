import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaveMgtComponent } from './leave-mgt/leave-mgt.component'; // <--- Import this
import { PayslipComponent } from './payslip/payslip.component'; // (Coming soon)
import { ProfileComponent } from './profile/profile.component';
export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  
  // Add the Leave Management Route
  { path: 'leave-mgt', component: LeaveMgtComponent },
  
  { path: 'payslip', component: PayslipComponent }, // We will uncomment this next
  
  { path: 'profile', component: ProfileComponent },
  
  { path: '**', redirectTo: 'login' }
];
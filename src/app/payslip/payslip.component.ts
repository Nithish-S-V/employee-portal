import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Payslip } from '../models/api.models';

@Component({
  selector: 'app-payslip',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './payslip.component.html',
  styleUrls: ['./payslip.component.css']
})
export class PayslipComponent implements OnInit {

  currentUser: any = null;
  isLoading: boolean = false;
  
  // Selection
  selectedYear: string = new Date().getFullYear().toString();
  selectedMonth: string = (new Date().getMonth() + 1).toString().padStart(2, '0');
  
  // Dropdown Options
  years: string[] = [];
  months = [
    { val: '01', name: 'January' }, { val: '02', name: 'February' },
    { val: '03', name: 'March' },   { val: '04', name: 'April' },
    { val: '05', name: 'May' },     { val: '06', name: 'June' },
    { val: '07', name: 'July' },    { val: '08', name: 'August' },
    { val: '09', name: 'September'},{ val: '10', name: 'October' },
    { val: '11', name: 'November' },{ val: '12', name: 'December' }
  ];

  // Result
  payslipData: Payslip | null = null;
  errorMessage: string = '';

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    // Generate last 5 years
    const currentYear = new Date().getFullYear();
    for(let i=0; i<5; i++) {
      this.years.push((currentYear - i).toString());
    }
  }

  ngOnInit(): void {
    this.currentUser = this.auth.currentUserValue;
    if (!this.currentUser) {
      this.router.navigate(['/login']);
    }
  }

  fetchPayslip() {
    this.isLoading = true;
    this.errorMessage = '';
    this.payslipData = null;

    this.api.getPayslip(this.currentUser.Empid, this.selectedYear, this.selectedMonth)
      .subscribe({
        next: (res) => {
          this.payslipData = res.d;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.errorMessage = 'No payslip found for this period.';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
  }

  downloadPdf() {
    if (!this.payslipData?.PdfContent) {
      alert('No PDF content available from SAP.');
      return;
    }

    // 1. Convert Base64 string to Byte Array
    const byteCharacters = atob(this.payslipData.PdfContent);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);

    // 2. Create Blob (PDF File)
    const blob = new Blob([byteArray], { type: 'application/pdf' });

    // 3. Create URL and Open
    const fileURL = URL.createObjectURL(blob);
    window.open(fileURL, '_blank');
  }
}
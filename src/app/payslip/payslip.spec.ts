import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { PayslipComponent } from './payslip.component';
import { ApiService } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';



// Mock Services
class MockApiService {
  public lastEmailPayload: any = null;

  getEmployeeProfile(id: string) {
    return of({ d: { Email: 'test@profile.com' } });
  }
  sendPayslipEmail(payload: any) {
    this.lastEmailPayload = payload;
    return of({ success: true });
  }
}

class MockAuthService {
  currentUserValue = { Empid: '123' };
}

class MockRouter {
  navigate(path: string[]) { }
}

describe('PayslipComponent', () => {
  let component: PayslipComponent;
  let fixture: ComponentFixture<PayslipComponent>;
  let apiService: MockApiService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PayslipComponent], // Standalone component
      providers: [
        { provide: ApiService, useClass: MockApiService },
        { provide: AuthService, useClass: MockAuthService },
        { provide: Router, useClass: MockRouter },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PayslipComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService) as unknown as MockApiService;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call API to send email for custom destination', () => {
    // 1. Setup Data
    component.payslipData = {
      Pernr: '123',
      PayYear: '2025',
      PayMonth: '10',
      NetPay: '1000',
      Currency: 'EUR',
      PdfContent: 'JVBERi0xLjQK...'
    };

    // 2. Configure for Custom Email
    component.emailDestination = 'custom';
    component.customEmail = 'custom@example.com';

    // 3. Trigger Email
    component.emailPdf();

    // 4. Verify API Call using manual mock tracking
    expect(apiService.lastEmailPayload).not.toBeNull();
    expect(apiService.lastEmailPayload.email).toBe('custom@example.com');
    expect(apiService.lastEmailPayload.year).toBe(component.selectedYear);

    // 5. Verify Success State
    expect(component.isEmailingPdf).toBe(false);
    expect(component.successMessage).toContain('custom@example.com');
  });

  it('should validate invalid custom email', () => {
    // Mock alert to prevent browser popup during test and track calls
    let alertMessage = '';
    window.alert = (msg: any) => { alertMessage = msg; };

    component.payslipData = {
      Pernr: '123', Year: '2025', Month: '10', NetPay: '1000', Currency: 'EUR', PdfContent: 'dummy'
    } as any;

    component.emailDestination = 'custom';
    component.customEmail = 'invalid-email';

    component.emailPdf();

    expect(alertMessage).toBe('Please enter a valid email address.');
  });
});

import { Injectable, Inject, PLATFORM_ID } from '@angular/core'; // <--- Import Inject & PLATFORM_ID
import { isPlatformBrowser } from '@angular/common';             // <--- Import isPlatformBrowser
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, switchMap, of } from 'rxjs';
import { AuthResponse, ODataSingleResponse } from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = '/sap/opu/odata/sap/ZEMP_PORTAL_863_SRV';
  
  public csrfToken: string | null = null;
  
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Inject PLATFORM_ID to check if we are on Server or Browser
  constructor(
    private http: HttpClient, 
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // FIX: Only access localStorage if we are in the Browser
    if (isPlatformBrowser(this.platformId)) {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        this.currentUserSubject.next(JSON.parse(savedUser));
      }
    }
  }

  login(empid: string, password: string): Observable<ODataSingleResponse<AuthResponse>> {
    return this.fetchToken().pipe(
      switchMap(() => {
        const body = { Empid: empid, Password: password };
        return this.http.post<ODataSingleResponse<AuthResponse>>(`${this.baseUrl}/AuthSet`, body);
      }),
      tap(response => {
        if (response.d.Success) {
          this.currentUserSubject.next(response.d);
          
          // FIX: Only save to localStorage in Browser
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.d));
          }
        }
      })
    );
  }

  private fetchToken(): Observable<any> {
    return this.http.get(`${this.baseUrl}/$metadata`, { responseType: 'text' });
  }

  logout() {
    this.csrfToken = null;
    this.currentUserSubject.next(null);
    
    // FIX: Only remove from localStorage in Browser
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
    }
  }

  get currentUserValue(): AuthResponse | null {
    return this.currentUserSubject.value;
  }
}
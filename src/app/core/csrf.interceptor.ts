import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { tap } from 'rxjs';

export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  // 1. Always send Cookies (Session)
  let headers = req.headers;
  
  // 2. If it's a GET request, ask for a Token
  if (req.method === 'GET') {
    headers = headers.set('X-CSRF-Token', 'Fetch');
  }

  // 3. If it's a POST/PUT, inject the stored Token
  if (req.method === 'POST' || req.method === 'PUT') {
    if (authService.csrfToken) {
      headers = headers.set('X-CSRF-Token', authService.csrfToken);
    }
    headers = headers.set('Content-Type', 'application/json');
    headers = headers.set('Accept', 'application/json');
  }

  // Clone request with new configuration
  const authReq = req.clone({
    withCredentials: true, // IMPORTANT: Allows sending/receiving cookies
    headers: headers
  });

  return next(authReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        // 4. Snoop the response for a new Token
        const token = event.headers.get('x-csrf-token');
        if (token && token !== 'Required') {
          console.log('CSRF Token Fetched:', token);
          authService.csrfToken = token;
        }
      }
    })
  );
};
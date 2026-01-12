import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private LOGIN_URL = 'https://auth.srs-ssms.com/api/dev/login';
  private TOKEN_KEY = 'api_token';

  constructor(private http: HttpClient) {}

  login(email: string, password: string) {
    const body = new HttpParams()
      .set('email', email)
      .set('password', password);

    return this.http.post<any>(this.LOGIN_URL, body).pipe(
      tap(res => {
        const ok = res?.statusCode === 1;
        const token = res?.data?.api_token;

        if (ok && token) {
          localStorage.setItem(this.TOKEN_KEY, token);
        }
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

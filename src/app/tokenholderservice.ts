import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class TokenService {
  private token: string | null = null;
  public getToken(): string | null {
    return this.token;
  }
  public setToken(token: string): void {
    this.token = token;
  }
}

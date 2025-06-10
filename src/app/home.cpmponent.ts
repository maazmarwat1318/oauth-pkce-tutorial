import { HttpClient } from '@angular/common/http';
import { Component, signal } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { environment } from '../environments/environment';
import { TokenService } from './tokenholderservice';
import { NgIf } from '@angular/common';
import { sha256 } from 'js-sha256';
import { single } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  title = 'oauth-pkec-tutorial';
  code: string | null = null;
  isAuthLoading = signal(false);
  constructor(
    private _httpClient: HttpClient,
    private _activatedRoute: ActivatedRoute,
    private _tokenService: TokenService,
    private _router: Router
  ) {
    this.code =
      this.parseFragment(_activatedRoute.snapshot.fragment ?? '')['code'] ??
      null;
    if (this.code) _tokenService.setToken(this.code);
  }

  async onAuth() {
    let codeVerifier =
      'sjd8dJ*#&8299wj(W()W(d)W:LW{}:>{}_)&%$38dlw;:WAA:WDLK:LAKD:ow&*#$^&@%askd*(&&*SDHASKKL*&##"()@*#"?ma';
    let codeChallenge = await this.generateCodeChallenge(codeVerifier);
    sessionStorage.setItem('code_verifier', codeVerifier);
    let authTokenRequestUrl = encodeURI(
      `${environment.oAuthUrl}?scope=https://www.googleapis.com/auth/gmail.readonly&prompt=consent&redirect_uri=http://localhost:4200/oauth&response_type=code&client_id=${environment.oAuthClientId}&code_challenge=${codeChallenge}&code_challenge_method=S256`
    );
    window.open(authTokenRequestUrl, 'oauth', 'width=500, height=600');
    window.addEventListener('message', async (event) => {
      if (event.origin !== window.location.origin) return;
      const { code } = event.data;
      console.log(code);

      const params = new URLSearchParams({
        client_id: environment.oAuthClientId,
        client_secret: environment.oAuthClientSecret,
        redirect_uri: 'http://localhost:4200/oauth',
        grant_type: 'authorization_code',
        code: code,
        code_verifier: sessionStorage.getItem('code_verifier') ?? '',
      });
      this.isAuthLoading.set(true);
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }).finally(() => {
        this.isAuthLoading.set(false);
      });

      const data = await response.json();
      if (response.status === 200 || response.status === 201) {
        this._tokenService.setToken(data.access_token);
        this._router.navigate(['view-emails']);
      }
    });
  }

  private parseFragment(fragment: string): Record<string, string | null> {
    const params = new URLSearchParams(fragment);
    const result: Record<string, string | null> = {};
    for (const [key, value] of params.entries()) {
      result[key] = value;
    }
    return result;
  }

  async generateCodeChallenge(codeVerifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    const base64url = btoa(String.fromCharCode(...new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    return base64url;
  }
}

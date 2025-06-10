import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'oauth',
  template: ` <p>Please wait while we redirect you to your application</p> `,
})
export class OAuthComponent {
  constructor(private _activatedRoute: ActivatedRoute) {}

  ngAfterViewInit() {
    let code = this._activatedRoute.snapshot.queryParams['code'];
    if (code) {
      if (window.opener) {
        window.opener.postMessage({ code }, window.location.origin);
        window.close();
      } else {
        document.body.innerText = 'Could not return code to opener.';
      }
    }
  }
}

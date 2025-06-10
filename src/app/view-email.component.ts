import { Component, OnInit } from '@angular/core';
import { GmailService } from './gmailservice';
import { TokenService } from './tokenholderservice';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'view-emails',
  imports: [NgFor, NgIf],
  template: `
    <div class="message-list" *ngIf="emails?.length">
      <div class="message-card" *ngFor="let msg of emails">
        <h3>{{ msg.subject }}</h3>
        <p class="from"><strong>From:</strong> {{ msg.from }}</p>
        <p class="snippet">{{ msg.snippet }}</p>
      </div>
    </div>

    <div *ngIf="emails?.length === 0">
      <p>No messages found.</p>
    </div>
  `,
  styles: `
    .message-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .message-card {
      border: 1px solid #ccc;
      border-left: 5px solid #0077ff;
      border-radius: 6px;
      padding: 1rem;
      background-color: #f9f9f9;
      box-shadow: 1px 1px 4px rgba(0,0,0,0.05);
    }

    .message-card h3 {
      margin: 0 0 0.5rem;
      color: #333;
    }

    .message-card .from {
      font-size: 0.9rem;
      color: #555;
    }

    .message-card .snippet {
      margin-top: 0.5rem;
      font-style: italic;
      color: #666;
    }
  `,
})
export class ViewEmailComponent implements OnInit {
  emails: any;
  constructor(
    private _gmailService: GmailService,
    private _tokenService: TokenService
  ) {}

  ngOnInit() {
    this._gmailService
      .getBasicMessages(this._tokenService.getToken() ?? '')
      .subscribe({
        next: (data) => {
          this.emails = data;
          console.log(this.emails);
        },
        error: (err) => {
          console.error('Error fetching emails:', err);
        },
      });
  }
}

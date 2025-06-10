import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { forkJoin, map, mergeMap, switchMap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GmailService {
  private baseUrl = 'https://gmail.googleapis.com/gmail/v1/users/me';

  constructor(private http: HttpClient) {}

  getBasicMessages(accessToken: string) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${accessToken}`,
    });

    return this.http
      .get<any>(`${this.baseUrl}/messages?maxResults=10`, { headers })
      .pipe(
        mergeMap((res) => {
          const messageCalls: any[] = res.messages.map((msg: any) =>
            this.http.get<any>(
              `${this.baseUrl}/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From`,
              { headers }
            )
          );
          return forkJoin(messageCalls);
        }),
        map((messages: any[]) =>
          messages.map((msg) => {
            const headers = msg.payload.headers;
            const subject =
              headers.find((h: any) => h.name === 'Subject')?.value ||
              '(No Subject)';
            const from =
              headers.find((h: any) => h.name === 'From')?.value ||
              '(Unknown Sender)';
            return {
              id: msg.id,
              subject,
              from,
              snippet: msg.snippet,
            };
          })
        )
      );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  url = 'https://mail.tybofashion.co.za/send-tybo-fashion-email-service.php';

  constructor(private http: HttpClient) {}
  send(emailPayload: IEmail) {
    return this.http.post<IEmailResponse>(this.url, emailPayload);
  }
}


export interface IEmail {
  sender_name: string;
  recipient_name: string;
  recipient_email: string;
  subject: string;
  message: string;
}

export interface IEmailResponse {
  message: string;
}

export function initEmail(): IEmail {
  return {
    sender_name: '',
    recipient_name: '',
    recipient_email: '',
    subject: '',
    message: '',
  };
}

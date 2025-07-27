import { Job } from 'src/models/job.model';
import { EmailService, initEmail } from './email.service';
import { Constants } from 'src/constants/Constants';
import { User } from 'src/models/user.model';

export class UserEmailHelper {
  baseUrl: string;
  constructor(private emailService: EmailService, private user: User) {
    const url = window.location.href;
    this.baseUrl = url.split('/').slice(0, 3).join('/');
  }

  sendPasswordResetEmail() {
    const email = this.generatePasswordResetEmail();
    this.sendEmail(
      this.user.Email,
      this.user.Name,
      'Tybo Fashion Team',
      'Password Reset',
      email
    );
  }

  generatePasswordResetEmail() {
    const link = `${this.baseUrl}/home/${Constants.PassUrl}/${this.user.UserToken}`;
    const email = this.user.Email;
    const name = this.user.Name;
    return `
      <div>
        <h2 style="font-family: Arial, sans-serif; color: #444;">Password Reset</h2>
        <p>Hi ${name},</p>
        <p>You recently requested to reset your password. Click the link below to reset your password:</p>
        <a href="${link}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none;">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br />Tybo Fashion Team</p>
      </div>
    `;
  }

  sendEmail(
    recipient_email: string,
    recipient_name: string,
    sender_name: string,
    subject: string,
    message: string
  ) {
    const email = initEmail();

    //Recipients & Sender
    email.recipient_email = recipient_email;
    email.recipient_name = recipient_name;
    email.sender_name = sender_name;

    //Sender
    email.subject = subject;
    email.message = message;

    //Send Email
    this.emailService.send(email).subscribe(() => {});
  }
}

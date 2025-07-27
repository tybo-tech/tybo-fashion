import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Constants } from 'src/constants/Constants';
import { EmailService, initEmail } from 'src/services/email.service';
import { UxService } from 'src/services/ux.service';

@Component({
  selector: 'app-contact-us-modal',
  templateUrl: './contact-us-modal.component.html',
  styleUrls: ['./contact-us-modal.component.scss'],
})
export class ContactUsModalComponent {

  @Input() subject = '';
  @Input() body = '';
  @Input() senderEmail = '';
  @Input() senderName = '';
  @Output() closeModal = new EventEmitter();
  constructor(private emailService: EmailService, private ux: UxService) { }
  sendEmail() {
    const email =  initEmail();

    //Recipients & Sender
    email.recipient_email = Constants.Email;
    email.recipient_name = Constants.ContactPerson;
    email.sender_name = this.senderName;

    //Sender
    email.subject = this.subject;
    email.message = this.body + '\n' + this.senderEmail;

    //Send Email
    this.emailService.send(email).subscribe((res) => {
      if (res && res.message === 'Email sent successfully') {
        this.ux.show_toast('Your enquiry was sent successfully',
          'Success', [
          'bg-success',
          'text-white',
        ]);
        this.closeModal.emit();
      }
    });
  }
}

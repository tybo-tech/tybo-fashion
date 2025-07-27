import { Job } from 'src/models/job.model';
import { EmailService, initEmail } from './email.service';
import { Constants } from 'src/constants/Constants';

export class OrderEmailHelper {
  constructor(private emailService: EmailService, private job: Job) {
    const emails = this.generateOrderEmails(this.job);

    // Send customer email
    this.sendEmail(
      this.job.Customer?.Email || '',
      this.job.Customer?.Name || 'Valued Customer',
      this.job.Company?.Name || '',
      `Order Confirmation - ${this.job.Metadata?.InvoiceNo}`,
      emails.customerEmail
    );

    // Send designer email
    this.sendEmail(
      this.job.Company?.Email || '',
      this.job.Company?.Name || '',
      'Tybo Fashion Vendor Team',
      `New Order Received - ${this.job.Metadata?.InvoiceNo}`,
      emails.designerEmail
    );

    // Send platform owner email
    this.sendEmail(
      Constants.Email,
      Constants.ContactPerson,
      'Tybo Fashion Team',
      `New Order Created on the System - ${this.job.Metadata?.InvoiceNo}`,
      emails.platformOwnerEmail
    );
  }

  generateOrderEmails(job: Job): {
    customerEmail: string;
    designerEmail: string;
    platformOwnerEmail: string;
  } {
    const currency = 'R'; // Currency symbol
    const { Customer, JobItems, Metadata, TotalCost, Company } = job;
  
    // Helper function to generate an order table
    const generateOrderTable = (items: typeof JobItems) => {
      return `
        <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif; color: #333;">
          <thead>
            <tr style="background-color: #f4f4f4; text-align: left;">
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Image</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Item Name</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Size</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Quantity</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Unit Price</th>
              <th style="padding: 10px; border-bottom: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${items
              ?.map(
                (item) => `
              <tr>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                  <img src="${item.FeaturedImageUrl}" alt="${item.ItemName}" style="width: 50px; height: 50px; object-fit: cover;" />
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.ItemName}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.Size || 'N/A'}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.Quantity}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${currency}${item.UnitPrice}</td>
                <td style="padding: 10px; border-bottom: 1px solid #ddd;">${currency}${item.SubTotal}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
      `;
    };
  
    // Email for the customer
    const customerEmail = `
      <div>
        <h2 style="font-family: Arial, sans-serif; color: #444;">Order Confirmation</h2>
        <p>Hi ${Customer?.Name || 'Valued Customer'},</p>
        <p>Thank you for your order! Your order has been successfully placed. Here are the details:</p>
        <p><strong>Invoice Number:</strong> ${Metadata.InvoiceNo}</p>
        ${generateOrderTable(JobItems)}
        <p><strong>Total Cost:</strong> ${currency}${TotalCost}</p>
        <p>Your order will be processed shortly. If you selected shipping, you will receive a notification once your order is shipped. For collections, please await further instructions.</p>
        <p>Best regards,<br />${Company?.Name}</p>
      </div>
    `;
  
    // Email for the fashion designer
    const designerEmail = `
      <div>
        <h2 style="font-family: Arial, sans-serif; color: #444;">New Order Received</h2>
        <p>Hi ${Company?.Name},</p>
        <p>A new order has been placed on your store. Here are the details:</p>
        <p><strong>Customer Name:</strong> ${Customer?.Name || 'N/A'}</p>
        <p><strong>Customer Email:</strong> ${Customer?.Email || 'N/A'}</p>
        <p><strong>Invoice Number:</strong> ${Metadata.InvoiceNo}</p>
        ${generateOrderTable(JobItems)}
        <p><strong>Total Cost:</strong> ${currency}${TotalCost}</p>
        <p>Please process the order and notify the customer about the status.</p>
        <p>Best regards,<br />Tybo Fashion Vendor Team</p>
      </div>
    `;
  
    // Email for the platform owner
    const platformOwnerEmail = `
      <div>
        <h2 style="font-family: Arial, sans-serif; color: #444;">New Order Created on the System</h2>
        <p>Hi Platform Owner,</p>
        <p>A new order has been created on the system. Here are the details:</p>
        <p><strong>Fashion Designer:</strong> ${Company?.Name}</p>
        <p><strong>Designer Email:</strong> ${Company?.Email}</p>
        <p><strong>Invoice Number:</strong> ${Metadata.InvoiceNo}</p>
        <p><strong>Customer Details:</strong></p>
        <ul>
          <li><strong>Name:</strong> ${Customer?.Name || 'N/A'}</li>
          <li><strong>Email:</strong> ${Customer?.Email || 'N/A'}</li>
          <li><strong>Phone:</strong> ${Customer?.PhoneNumber || 'N/A'}</li>
        </ul>
        ${generateOrderTable(JobItems)}
        <p><strong>Total Cost:</strong> ${currency}${TotalCost}</p>
        <p>Please ensure the order is tracked and managed accordingly.</p>
        <p>Best regards,<br />Tybo Fashion Team</p>
      </div>
    `;
  
    return {
      customerEmail,
      designerEmail,
      platformOwnerEmail,
    };
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

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private config: ConfigService) {
    this.from = this.config.get<string>('mail.from') || 'Store <no-reply@example.com>';
    this.transporter = nodemailer.createTransport({
      host: this.config.get('mail.host'),
      port: this.config.get('mail.port'),
      secure: this.config.get('mail.port') === 465,
      auth: {
        user: this.config.get('mail.user'),
        pass: this.config.get('mail.pass'),
      },
    });
  }

  private async send(to: string, subject: string, html: string) {
    try {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
    } catch (err) {
      this.logger.error(`Failed to send email to ${to}: ${err.message}`);
    }
  }

  async sendOtp(to: string, code: string, purpose: string) {
    const subject =
      purpose === 'password_reset'
        ? 'Your password reset code'
        : purpose === 'email_verify'
          ? 'Verify your email to finish signing up'
          : 'Your verification code';
    const intro =
      purpose === 'email_verify'
        ? '<p>Use this code to verify your email and finish creating your account:</p>'
        : '<p>Your one-time code is:</p>';
    const html = `
      ${intro}
      <h2 style="letter-spacing:4px">${code}</h2>
      <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
    `;
    await this.send(to, subject, html);
  }

  async sendOrderConfirmation(to: string, orderNumber: string, total: number) {
    const html = `
      <p>Thank you for your order!</p>
      <p>Your order <strong>#${orderNumber}</strong> has been placed successfully.</p>
      <p>Total: <strong>${total.toFixed(2)}</strong></p>
      <p>Payment method: Cash on Delivery</p>
    `;
    await this.send(to, `Order Confirmation — #${orderNumber}`, html);
  }

  async sendAdminNewOrderNotification(
    adminEmail: string,
    orderNumber: string,
    customerName: string,
    customerEmail: string,
    total: number,
  ) {
    const html = `
      <p>A new order has been placed.</p>
      <ul>
        <li>Order #: ${orderNumber}</li>
        <li>Customer: ${customerName} (${customerEmail})</li>
        <li>Total: ${total.toFixed(2)}</li>
      </ul>
    `;
    await this.send(adminEmail, `New Order — #${orderNumber}`, html);
  }

  async sendContactMessageNotification(
    adminEmail: string,
    data: { name: string; email: string; phone?: string; subject?: string; message: string },
  ) {
    const html = `
      <p>New message from the contact form:</p>
      <ul>
        <li>Name: ${data.name}</li>
        <li>Email: ${data.email}</li>
        ${data.phone ? `<li>Phone: ${data.phone}</li>` : ''}
        ${data.subject ? `<li>Subject: ${data.subject}</li>` : ''}
      </ul>
      <p style="white-space:pre-wrap">${data.message}</p>
    `;
    await this.send(adminEmail, `Contact form: ${data.subject || 'New message'}`, html);
  }

  async sendContactMessageConfirmation(to: string, name: string) {
    const html = `
      <p>Hi ${name},</p>
      <p>Thanks for reaching out — we've received your message and will get back to you as soon as we can.</p>
    `;
    await this.send(to, "We've received your message", html);
  }
}

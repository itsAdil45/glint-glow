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
      purpose === 'password_reset' ? 'Your password reset code' : 'Your verification code';
    const html = `
      <p>Your one-time code is:</p>
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
}

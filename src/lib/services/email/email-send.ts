import 'dotenv/config';
import * as nodemailer from 'nodemailer';
import { EmailTemplates } from 'src/lib/templates/email';
import { SendMailOptions, Transporter } from 'nodemailer';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';

const {
  welcomeEmail,
  resetPassword,
  loginAlert,
  verifyEmail,
  doctorNotification,
} = EmailTemplates;

export interface MailOpts {
  to?: string;
  ua?: string;
  name?: string;
  action?: string;
  timeISO?: string;
  patientId?: string;
  dateTime?: string;
  resetLink?: string;
  appointmentLink?: string;
  verificationLink?: string;
}

interface Template {
  subject: string;
  html: string;
  text: string;
}

@Injectable()
export class EmailSendService implements OnModuleInit {
  private transporter: Transporter;
  private readonly logger: Logger;

  constructor() {
    this.logger = new Logger(EmailSendService.name);
  }

  onModuleInit() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.APP_USERNAME || '',
        pass: process.env.APP_PASSWORD || '',
      },
    });
  }

  async initializeEmailSender(
    mail: MailOpts,
    type:
      | 'welcome'
      | 'reset-password'
      | 'login-alert'
      | 'verify-email'
      | 'book-appointment'
      | 'cancel-appointment'
      | 'reschedule-appointment',
  ) {
    const { resetLink, ua, verificationLink, to, name, patientId, dateTime } =
      mail;
    const params: MailOpts = {};
    let template: Template = { subject: '', html: '', text: '' };

    switch (type) {
      case 'welcome':
        params.name = to?.toString().split('@')[0];
        template = welcomeEmail(params);
        break;
      case 'reset-password':
        params.resetLink = resetLink;
        template = resetPassword(params as { resetLink: string });
        break;
      case 'login-alert':
        params.timeISO = new Date().toISOString();
        params.ua = ua;
        template = loginAlert(params as { timeISO: string; ua?: string });
        break;
      case 'verify-email':
        params.verificationLink = verificationLink;
        template = verifyEmail(params as { verificationLink: string });
        break;
      case 'book-appointment':
        params.name = name;
        params.patientId = patientId;
        params.dateTime = dateTime;
        params.appointmentLink = '';
        params.action = type.split('-')[0];
        template = doctorNotification(
          params as {
            name: string;
            patientId: string;
            dateTime: string;
            action: string;
            appointmentLink: string;
          },
        );
    }
    return this.sendEmail({ ...mail, ...template });
  }

  async sendEmail(mail: SendMailOptions) {
    this.logger.log(`Sending email to ${mail.to}`);
    try {
      const info = await this.transporter.sendMail({
        from: process.env.SENDER_EMAIL,
        ...mail,
      });
      this.logger.log('Message sent: %s', info.messageId);
      if (!info) return { success: false, message: 'Email not sent' };
      return { success: true, message: 'Email sent' };
    } catch (error) {
      this.logger.error(`Error sending email: ${error}`);
      throw error;
    }
  }
}

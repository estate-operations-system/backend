import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const config: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendVerificationCode(email: string, code: string, _telegramId?: string): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP not configured. Skipping email send. Code:', code);
      return;
    }

    const mailOptions = {
      from: `"Estate Operations" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Код подтверждения для Estate Operations',
      html: `
        <div style="font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif; width: 600px; margin: 0 auto;">
          <div style="background-color: white; border-radius: 12px; overflow: hidden; border: 1px solid #dec3ba; box-shadow: 0 2px 8px rgba(104, 63, 49, 0.1);">
            <div style="background: linear-gradient(135deg, #683f31 0%, #452a21 100%); padding: 20px 20px; text-align: center;">
              <h1 style="color: white; font-size: 24px; font-weight: 600; margin: 0;">Estate Operations</h1>
            </div>
            <div style="padding: 40px;">
              <p style="color: #8b5441; font-size: 14px; margin-bottom: 16px; margin-top: 0;">Здравствуйте! Вы запросили код подтверждения для авторизации в системе Estate Operations.</p>
              <div style="background-color: #efe1dc; border: 1px solid #dec3ba; border-radius: 8px; padding: 32px 20px; margin: 32px 0; text-align: center;">
                <div style="color: #683f31; font-size: 36px; font-weight: 700; letter-spacing: 8px; font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Courier New', monospace;">${code}</div>
              </div>
              <div style="background-color: #f7f0ee; border-left: 4px solid #ad6952; border-radius: 4px; padding: 16px; margin: 24px 0;">
                <p style="color: #683f31; font-size: 13px; margin: 0;">Код действителен в течение 10 минут.</p>
              </div>
              <p style="color: #8b5441; font-size: 14px; margin-bottom: 0;">Если вы не запрашивали код, просто игнорируйте это письмо.</p>
            </div>
            <div style="background-color: #f7f0ee; padding: 24px 40px; border-top: 1px solid #dec3ba;">
              <p style="color: #8b5441; font-size: 12px; margin: 0;">Это автоматическое сообщение. Пожалуйста, не отвечайте на него.</p>
              <p style="color: #8b5441; font-size: 12px; margin-top: 12px; margin-bottom: 0;">© 2026 Estate Operations.</p>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log(`Verification code sent to ${email}`);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Не удалось отправить код подтверждения');
    }
  }

  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

export default EmailService;

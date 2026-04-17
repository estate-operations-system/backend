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
        user: process.env.SMTP_USER || 'garfild0407@gmail.com',
        pass: process.env.SMTP_PASS || 'ipmy mtgb rvwp fdad',
      },
    };

    this.transporter = nodemailer.createTransport(config);
  }

  async sendVerificationCode(email: string, code: string, telegramId: string): Promise<void> {
    // Check if SMTP is configured
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn('SMTP not configured. Skipping email send. Code:', code);
      return;
    }

    const mailOptions = {
      from: `"Estate Operations" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Код подтверждения для Estate Operations',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Код подтверждения</h2>
          <p>Здравствуйте!</p>
          <p>Вы запросили код подтверждения для регистрации/авторизации в системе Estate Operations.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h1 style="color: #1e40af; font-size: 32px; margin: 0; letter-spacing: 5px;">${code}</h1>
          </div>
          <p><strong>Ваш Telegram ID:</strong> ${telegramId}</p>
          <p>Код действителен в течение 10 минут.</p>
          <p>Если вы не запрашивали этот код, просто игнорируйте это письмо.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
          <p style="color: #64748b; font-size: 14px;">
            Это автоматическое сообщение. Пожалуйста, не отвечайте на него.
          </p>
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
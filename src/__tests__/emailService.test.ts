import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.resetModules();

const nodemailerMock = {
  createTransport: jest.fn(() => ({
    sendMail: jest.fn<any>().mockResolvedValue({}),
    verify: jest.fn<any>().mockResolvedValue(true),
  })),
};

jest.doMock('nodemailer', () => nodemailerMock);

describe('EmailService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  it('skips sending if SMTP not configured', async () => {
    const { default: EmailService } = await import('../utils/emailService');

    const svc = new EmailService();

    await expect(svc.sendVerificationCode('a@b.com', '1234')).resolves.toBeUndefined();

    expect(nodemailerMock.createTransport).toHaveBeenCalled();

    const transporter: any = (nodemailerMock.createTransport as any).mock.results[0].value;

    expect(transporter.sendMail).not.toHaveBeenCalled();
  });

  it('sends email when SMTP configured', async () => {
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'pass';

    const { default: EmailService } = await import('../utils/emailService');

    const svc = new EmailService();

    await expect(svc.sendVerificationCode('a@b.com', '5678')).resolves.toBeUndefined();

    const transporter: any = (nodemailerMock.createTransport as any).mock.results[0].value;

    expect(transporter.sendMail).toHaveBeenCalled();
  });

  it('verifyConnection returns true/false based on transporter.verify', async () => {
    const { default: EmailService } = await import('../utils/emailService');

    const svc = new EmailService();

    const transporter: any = (nodemailerMock.createTransport as any).mock.results[0].value;

    transporter.verify.mockResolvedValueOnce(true);

    await expect(svc.verifyConnection()).resolves.toBe(true);

    transporter.verify.mockRejectedValueOnce(new Error('fail'));

    await expect(svc.verifyConnection()).resolves.toBe(false);
  });
});

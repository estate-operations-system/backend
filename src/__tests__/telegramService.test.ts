import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.resetModules();

const sendMessageMock = jest.fn<any>().mockResolvedValue({});
const TelegramBotMock = jest.fn<any>().mockImplementation(() => ({ sendMessage: sendMessageMock }));

jest.doMock('node-telegram-bot-api', () => TelegramBotMock);

describe('telegramService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.BOT_TOKEN;
  });

  it('does nothing when BOT_TOKEN is not set', async () => {
    const mod = require('../utils/telegramService');
    await expect(mod.sendTelegramMessageToId(123, 'hi')).resolves.toBeUndefined();
    expect(TelegramBotMock).not.toHaveBeenCalled();
  });

  it('sends message when BOT_TOKEN is set', async () => {
    process.env.BOT_TOKEN = 'token';
    jest.resetModules();
    const mod = require('../utils/telegramService');

    await expect(mod.sendTelegramMessageToId(123, 'hello')).resolves.toBeUndefined();
    expect(TelegramBotMock).toHaveBeenCalledWith('token', { polling: false });
    expect(sendMessageMock).toHaveBeenCalledWith(123, 'hello');
  });
});

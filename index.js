require('dotenv').config();
process.env.NTBA_FIX_319 = 1; // disable telegram deprecated warnings on start up
const { chromium } = require('playwright'),
  notifier = require('node-notifier'),
  TelegramBot = require('node-telegram-bot-api');

const MAX_32_BIT_SIGNED_INTEGER = Math.pow(2, 31) - 1;

const username = process.env.USER_NAME;
const password = process.env.PASSWORD;
const centresString = process.env.CENTRES;
if (!username) throw new Exception('USER_NAME variable missing');
if (!password) throw new Exception('PASSWORD variable missing');
if (!centresString) throw new Exception('CENTRES variable missing');

const partnerUsername = process.env.PARTNER_USER_NAME;
const partnerPassword = process.env.PARTNER_PASSWORD;

const centres = centresString.split(',').map((x) => x.trim());
const delay = parseInt(process.env.DELAY || 300000);
const browserOptions = {
  headless: false,
  ...(process.env.BROWSER_OPTIONS
    ? JSON.parse(process.env.BROWSER_OPTIONS)
    : {}),
};

let notifyTelegramBot = null;
if (process.env.TELEGRAM_TOKEN && process.env.TELEGRAM_CHAT_ID) {
  notifyTelegramBot = (text) => {
    const bot = new TelegramBot(process.env.TELEGRAM_TOKEN);
    return bot.sendMessage(process.env.TELEGRAM_CHAT_ID, text);
  };
  console.log('Telegram connection enabled');
}

(async () => {
  const browser = await chromium.launch(browserOptions);
  let page;
  while (true) {
    if (browser.isConnected() === false) {
      console.error('Browser not connected, cannot continue :(');
      return;
    }
    try {
      page = await browser.newPage();
      page.setDefaultTimeout(90000);
      return await findAppointment(page);
    } catch (err) {
      console.log(`There was an error: ${err}.`);
      console.log(`Restarting from scratch...`);
      if (page && page.isClosed() === false) {
        page.close();
      }
    }
  }
})();

async function findAppointment(page) {
  console.log(`Starting with ${username}`);

  await page.goto(
    'https://sachsen.impfterminvergabe.de/civ.public/start.html?oe=00.00.IM&mode=cc&cc_key=IOAktion',
  );
  await page.click('button:has(span:is(:text("Weiter")))', {
    timeout: MAX_32_BIT_SIGNED_INTEGER, // Wait in queue
  });

  await page.waitForSelector('h3:is(:text("Zugangsdaten"))');
  await page.fill('text=Vorgangskennung', username);
  await page.fill('text=Passwort', password);
  await page.click('button:has(span:is(:text("Weiter")))');
  await page.click(
    'text=Termin zur Coronaschutzimpfung vereinbaren oder ändern',
  );
  await page.click('button:has(span:is(:text("Weiter")))');

  while (true) {
    for (let currentCentre of centres) {
      await page.waitForSelector('h3:is(:text("Vorgaben für Terminsuche"))');
      const centreSelectCombobox = await page.$(
        '[role=combobox]:near(label:is(:text("Ihr gewünschtes Impfcenter*")))',
      );
      await centreSelectCombobox.click();
      await page.click(`[role=listbox] li:is(:text("${currentCentre}"))`);

      if (partnerUsername && partnerPassword) {
        await page.click('label >> text=/Partnertermin/i');
        await page.fill(
          'text="Vorgangskennung Ihres Partners*"',
          partnerUsername,
        );
        await page.fill('text="Passwort Ihres Partners"', partnerPassword);
      }

      await page.click('button:has(span:is(:text("Weiter")))');

      await Promise.race([
        page.waitForSelector('h2:is(:text("Terminauswahl"))'),
        page.waitForSelector('h2:is(:text("Terminvergabe"))'),
        page.waitForSelector('h2:is(:text("Fehlermeldung"))'),
      ]);
      const isErrorPage = await page.$('h2:is(:text("Fehlermeldung"))');
      if (isErrorPage) {
        // we may get here if partner login is wrong
        console.error(
          'An error occured, please see the browser and check you config.',
        );
        return;
      }
      const noSuccessElement = await page.$('text=/keinen\\s*Termin/i');
      if (noSuccessElement === null) {
        console.log(`SUCCESS FOR ${currentCentre}`);
        await notifySuccess(currentCentre);
        return;
      }
      console.log(
        `No success for ${currentCentre} (${new Date().toLocaleTimeString()})`,
      );
      await page.click('button:has(span:is(:text("Zurück")))');
    }

    console.log(`Waiting for ${delay}ms`);
    await waitFor(delay);
  }
}

async function waitFor(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

async function notifySuccess(successCentre) {
  const message = `Ein Termin für ${successCentre} wurde gefunden!`;
  notifier.notify({
    title: 'Impftermin gefunden!',
    message,
  });
  if (notifyTelegramBot) {
    await notifyTelegramBot(`${process.env.USER_NAME}: ${message}`);
  }
}

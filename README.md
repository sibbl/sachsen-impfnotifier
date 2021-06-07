# Sachsen Impfnotifier

This tool regularly checks the [vaccination portal of Saxony, Germany](https://sachsen.impfterminvergabe.de) for available appointments for specified vaccination centres. It simulates mouse clicks in a real browser from the login to the page where a found appointment needs to be confirmed.

It still requires some luck to get behind the waiting area and then find an appointment. It's recommended to watch [the DRK Sachsen Twitter channel](https://twitter.com/drksachsen) to get the release times of new appointments. 

After configuring the tool as described below, it can be left running on any of your machines and when an appointment will be found and needs to be confirmed, a system notification pops up. Additionally you can configure a Telegram or Matrix bot to get notified there as well.

## Usage

Node.js and npm are required. You also need to be registered on the vaccination portal before being able to use this tool.

1. Run `npm ci` to install dependencies
2. Set the following environment variables e.g. by editing the `.env.sample` and renaming it to `.env`
   | Env var | Required | Description |
   | ------- | -------- | ----------- |
   | USER_NAME | Yes | Your so called "Vorgangskennung" |
   | PASSWORD | Yes | Your Password |
   | CENTRES | Yes | Comma separated list of centres to check: Belgern-Schildau, Borna, Kamenz, Chemnitz, Dresden, Treuen, Annaberg-Buchholz, Grimma, Löbau, Leipzig, Mittweida, Plauen, Pirna, Riesa, Zwickau |
   | DELAY | No | Delay between each check in ms (300000 ms = 5 min by default) |
   | BROWSER_OPTIONS | No | Custom [browser options](https://playwright.dev/docs/api/class-browsertype#browsertypelaunchoptions) as JSON string (f.e. to configure a proxy) |
   | PARTNER_USER_NAME | No | The so called "Vorgangskennung" of your partner you want to get an appointment with |
   | PARTNER_PASSWORD | No | Password of your partner |
   | TELEGRAM_TOKEN | No | Telegram bot token, if you want additionally to be notified via Telegram |
   | TELEGRAM_CHAT_ID | No | Telegram chat ID which you want to be notified at |
   | MATRIX_HOMESERVER | No | Matrix homeserver URL, if you want additionally to be notified via Matrix |
   | MATRIX_TOKEN | No | Matrix access token of your bot user (you have to register this user yourself!) |
   | MATRIX_ROOM_ID | No | Matrix internal room ID to which notifications should be sent, the bot user will automatically be invited to this room |

3. Run `node index.js`
4. Wait for the notification on your device (or Telegram, if set up additionally) and be lucky


# Sachsen Impfnotifier

This tool regularly checks the [vaccination portal of Saxony, Germany](https://sachsen.impfterminvergabe.de) for available appointments for specified vaccination centres.

## Usage

Node.js and npm are required. You also need to be registered on the vaccination portal before being able to use this tool.

1. Run `npm ci` to install dependencies
2. Set the following environment variables
   | Env var | Required | Description |
   | ------- | -------- | ----------- |
   | USER_NAME | Yes | Your so called "Vorgangskennung" |
   | PASSWORD | Yes | Your Password |
   | CENTRES | Yes | Comma separated list of centres to check: Belgern-Schildau, Borna, Kamenz, Chemnitz, Dresden, Treuen, Annaberg-Buchholz, Grimma, Löbau, Leipzig, Mittweida, Plauen, Pirna, Riesa, Zwickau |
   | DELAY | No | Delay between each check in ms (300000 ms = 5 min by default) |
   | BROWSER_OPTIONS | No | Custom [browser options](https://playwright.dev/docs/api/class-browsertype#browsertypelaunchoptions) as JSON string (f.e. to configure a proxy)

3. Run `node index.js`
4. Wait for the notification and be lucky

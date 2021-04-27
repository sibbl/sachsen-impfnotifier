require('dotenv').config()
const { chromium } = require('playwright'),
  notifier = require('node-notifier')

;(async () => {
  const centres = process.env.CENTRES.split(',').map((x) => x.trim())
  const delay = parseInt(process.env.DELAY || 300000)

  const browser = await chromium.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto(
    'https://sachsen.impfterminvergabe.de/civ.public/start.html?oe=00.00.IM&mode=cc&cc_key=IOAktion'
  )
  await page.click('button:has(span:is(:text("Weiter")))')

  await page.waitForSelector('h3:is(:text("Zugangsdaten"))')
  await page.fill('text=Vorgangskennung', process.env.USER_NAME)
  await page.fill('text=Passwort', process.env.PASSWORD)
  await page.click('button:has(span:is(:text("Weiter")))')
  await page.click(
    'text=Termin zur Coronaschutzimpfung vereinbaren oder ändern'
  )
  await page.click('button:has(span:is(:text("Weiter")))')

  while (true) {
    for (let currentCentre of centres) {
      await page.waitForSelector('h3:is(:text("Vorgaben für Terminsuche"))')
      const centreSelectCombobox = await page.$(
        '[role=combobox]:near(label:is(:text("Ihr gewünschtes Impfcenter*")))'
      )
      await centreSelectCombobox.click()
      await page.click(`[role=listbox] li:is(:text("${currentCentre}"))`)
      await page.click('button:has(span:is(:text("Weiter")))')

      const successElement = await page.$('"keinen Termin"')
      if (successElement !== null) {
        console.log(`SUCCESS FOR ${currentCentre}`)
        notifier.notify({
          title: 'Impftermin gefunden!',
          message: `Ein Termin für ${currentCentre} wurde gefunden!`,
        })
        return
      }
      console.log(`No success for ${currentCentre}`)
      await page.click('button:has(span:is(:text("Zurück")))')
    }

    console.log(`Waiting for ${delay}ms`)
    await waitFor(delay)
  }
})()

async function waitFor(duration) {
  return new Promise((resolve) => {
    setTimeout(resolve, duration)
  })
}

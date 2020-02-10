/*
waitUntil
load - consider navigation to be finished when the load event is fired.
domcontentloaded - consider navigation to be finished when the DOMContentLoaded event is fired.
networkidle0 - consider navigation to be finished when there are no more than 0 network connections for at least 500 ms.
networkidle2 - consider navigation to be finished when there are no more than 2 network connections for at least 500 ms.
 */
const puppeteer = require('puppeteer');

const getSiteText = async (url, timeOutInMs = 3000, waitUntil = 'domcontentloaded', evaluate, noRedirects =false) => {
    let browser, text, title;

    try {
        browser = await puppeteer.launch();
        const page = await browser.newPage();
        const navigationOptions = {
            timeout: timeOutInMs,
            waitUntil: waitUntil
        };

        if (noRedirects) {
            await page.setRequestInterception(true);

            page.on('request', request => {
                if (request.isNavigationRequest() || request.redirectChain().length){
                    request.abort();
                } else {
                    request.continue();
                }
            });
        }

        await page.goto(url, navigationOptions).catch((error) => console.log(error));

        text = await page.evaluate(() => document.body.innerText).catch((error) => console.log(error));
        title = await page.title();
    } catch (err) {
        return {
            error: err
        }
    } finally {
        await browser.close();
    }

    return {
        text: text,
        title: title
    }
};

module.exports = getSiteText;
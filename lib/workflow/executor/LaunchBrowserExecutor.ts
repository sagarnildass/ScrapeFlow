import { ExecutionEnvironment } from "@/types/executor";
import puppeteer from "puppeteer";
import { LaunchBrowserTask } from "../task/LaunchBrowser";

const BROWSER_WS = process.env.BROWSER_WS;
 
// const openDevTools = async (page: any, client: any) => {
//   const frameId = page.mainFrame()._id;
//   const chromeExecutable = "/usr/bin/google-chrome";
//   // get URL for devtools from scraping browser
//   const { url: inspectUrl } = await client.send("Page.inspect", { frameId });
//   // open devtools URL in local chrome in Ubuntu
//   exec(`"${chromeExecutable}" "${inspectUrl}"`, (error) => {
//     if (error) throw new Error("Unable to open devtools: " + error);
//   });
//   // wait for devtools ui to load
//   await waitFor(5000);
// };

export async function LaunchBrowserExecutor(
  environment: ExecutionEnvironment<typeof LaunchBrowserTask>
): Promise<boolean> {
  try {
    const websiteUrl = environment.getInput("Website Url");
    const browser = await puppeteer.connect({ browserWSEndpoint: BROWSER_WS });
    environment.log.info("Browser started successfully");
    environment.setBrowser(browser);
    const page = await browser.newPage();
    await page.setViewport({ width: 2560, height: 1440 });

    // const client = await page.createCDPSession();
    // await openDevTools(page, client);

    await page.goto(websiteUrl);
    environment.setPage(page);
    environment.log.info(`Opened page at: ${websiteUrl}`);
    return true;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    environment.log.error(error.message);
    return false;
  }
}

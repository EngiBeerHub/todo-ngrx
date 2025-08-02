import {expect} from "@wdio/globals";
import CategoryListPage from "../pageobjects/category-list.page.ts";

describe('TODO NgRx application', () => {
  before(async () => {
    // Switch webview context
    const webViewContext = (await driver.getContexts())
      .find(c => typeof c === 'string' && c.includes('WEBVIEW'));
    if (webViewContext) {
      await driver.switchContext(webViewContext);
    } else {
      throw new Error('WebView context not found');
    }
  });

  after(async () => {
    await driver.pause(5000);
  });

  it('should show loading when open', async () => {
    expect(CategoryListPage.loading).toBeDisplayed();
  });

  it('should hide loading after a while', async () => {
    await driver.pause(2000);
    expect(CategoryListPage.loading).not.toBeDisplayed();
  });
});

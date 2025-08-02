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
    await driver.pause(3000);
  });

  it('should show loading when open', async () => {
    expect(CategoryListPage.loading).toBeDisplayed();
  });

  it('should hide loading after a while', async () => {
    expect(CategoryListPage.loading).not.toBeDisplayed();
  });

  it('should show title', async () => {
    expect(CategoryListPage.title).toBeDisplayed();
    expect(CategoryListPage.title).toHaveText('マイリスト');
  });
});

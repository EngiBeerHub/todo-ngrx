import {expect} from "@wdio/globals";
import CategoryListPage from "../pageobjects/category-list.page";
import {nativeTapWithRightOffset, swipeLeft, switchWebview} from "../utils";

describe('Category List Page', () => {

  before(async () => {
    await browser.pause(2000);
    // Switch webview context
    await switchWebview();
    // wait for loading close
    await browser.pause(2000);
  });

  it('should show title', async () => {
    await expect(CategoryListPage.title).toBeDisplayed();
    await expect(CategoryListPage.title).toHaveText('マイリスト');
  });

  it('should show complete button when click new button', async () => {
    await expect(CategoryListPage.newButton).toBeDisplayed();
    // Act
    await CategoryListPage.newButton.click();
    // Assert
    await expect(CategoryListPage.completeButton).toBeDisplayed();
  });

  it('should also show keyboard', async () => {
    // ネイティブコンテキストに切り替え
    await browser.switchContext('NATIVE_APP');
    await browser.pause(2000);

    // Assert
    const kbVisible = await browser.isKeyboardShown();
    await expect(kbVisible).toBe(true);

    // WebViewコンテキストに戻す
    await switchWebview();
  });

  it('should add task after type and complete', async () => {
    // Arrange
    await expect(CategoryListPage.input).toBeDisplayed();
    // Act
    await CategoryListPage.input.setValue('new category');
    await CategoryListPage.completeButton.click();
    // Assert
    await expect(CategoryListPage.lastItemInList).toHaveText('new category');
  });

  it('should also hide keyboard', async () => {
    // ネイティブコンテキストに切り替え
    await browser.switchContext('NATIVE_APP');
    await browser.pause(1000);
    // Assert
    const kbVisible = await browser.isKeyboardShown();
    await expect(kbVisible).toBe(false);
    // WebViewコンテキストに戻す
    await switchWebview();
  });

  it('should delete item when tap option', async () => {
    // Act - swipe
    await swipeLeft(CategoryListPage.lastItemInList);
    await browser.pause(1000);

    // Act - tap
    await nativeTapWithRightOffset(CategoryListPage.lastItemInList, 20);
    await browser.pause(2000);

    // Assert
    await expect(CategoryListPage.lastItemInList).not.toHaveText('new category');
  });
});

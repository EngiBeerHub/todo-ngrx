import {ChainablePromiseElement} from "webdriverio";

/**
 * Context switch utility
 */
export async function switchWebview(): Promise<void> {
  const webViewContext = (await driver.getContexts())
    .find(c => typeof c === 'string' && c.includes('WEBVIEW'));
  if (webViewContext) {
    await driver.switchContext(webViewContext);
  } else {
    throw new Error('WebView context not found');
  }
}

export async function nativeTapWithRightOffset(element: ChainablePromiseElement, rightOffset: number): Promise<void> {
  const rect = await element.getElementRect(await element.elementId);
  await driver.execute('mobile: tap', {
    x: rect.x + rect.width + rightOffset,
    y: rect.y + rect.height / 2
  });
}

export async function swipeLeft(element: ChainablePromiseElement) {
  const rect = await element.getElementRect(await element.elementId);
  await driver.performActions([
    {
      type: 'pointer',
      id: 'finger1',
      parameters: {pointerType: 'touch'},
      actions: [
        {type: 'pointerMove', duration: 0, x: rect.x + rect.width - 10, y: rect.y + rect.height / 2},
        {type: 'pointerDown', button: 0},
        {type: 'pause', duration: 100},
        {type: 'pointerMove', duration: 300, x: rect.x + 10, y: rect.y + rect.height / 2},
        {type: 'pointerUp', button: 0}
      ]
    }
  ]);
}

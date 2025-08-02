import {$} from "@wdio/globals";

class CategoryListPage {
  get loading() {
    return $('ion-loading')
  }

  get title() {
    return $$('ion-title')[0]
  }
}

export default new CategoryListPage();

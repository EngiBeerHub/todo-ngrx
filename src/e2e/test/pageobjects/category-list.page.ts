import {$} from "@wdio/globals";

class CategoryListPage {
  get loading() {
    return $('ion-loading')
  }
}

export default new CategoryListPage();

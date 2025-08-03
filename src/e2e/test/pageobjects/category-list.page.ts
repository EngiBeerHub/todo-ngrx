class CategoryListPage {
  get title() {
    return $('#page-title');
  }

  get newButton() {
    return $('#new-button');
  }

  get completeButton() {
    return $('#complete-button');
  }

  get lastItemInList() {
    return $('ion-list ion-item-sliding:last-of-type ion-item');
  }

  get deleteItemButton() {
    return $('#delete-item-button');
  }

  get input() {
    // ion-inputやidではアクセス不可
    return $('input');
  }
}

export default new CategoryListPage();

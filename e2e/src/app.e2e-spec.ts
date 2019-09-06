import { AppPage } from './app.po';

describe('workspace-project App', () => {
  let page: AppPage;

  beforeEach(() => {
    page = new AppPage();
  });

  it('should start the application', () => {
    page.navigateTo();
    expect(page).toBeTruthy();
  });
});

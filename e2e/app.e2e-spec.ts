import { ScorecardPage } from './app.po';

describe('scorecard App', () => {
  let page: ScorecardPage;

  beforeEach(() => {
    page = new ScorecardPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});

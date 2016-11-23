import { ScorecardPage } from './app.po';

describe('scorecard App', function() {
  let page: ScorecardPage;

  beforeEach(() => {
    page = new ScorecardPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

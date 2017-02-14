import { SampleprojectPage } from './app.po';

describe('sampleproject App', function() {
  let page: SampleprojectPage;

  beforeEach(() => {
    page = new SampleprojectPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});

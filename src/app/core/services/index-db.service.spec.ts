import { TestBed } from '@angular/core/testing';

import { IndexDbService } from './index-db.service';

describe('IndexDbService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: IndexDbService = new IndexDbService({
      namespace: 'iapps',
      version: 1,
      models: {
        users: 'id'
      }
    });
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { LocalItems } from './local-items';

describe('LocalItems', () => {
  let service: LocalItems;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalItems);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

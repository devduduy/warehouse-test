import { TestBed } from '@angular/core/testing';

import { ExternalItems } from './external-items';

describe('ExternalItems', () => {
  let service: ExternalItems;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExternalItems);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

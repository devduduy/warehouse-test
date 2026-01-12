import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Item } from '../models/item';

interface ExternalItem {
  id: number;
  item_name: string;
  stock: string; // dari API string
  unit: string;
}

interface ExternalListResponse {
  statusCode: number;
  message: string;
  data: ExternalItem[];
}

@Injectable({ providedIn: 'root' })
export class ExternalItemsService {
  private LIST_URL = 'https://auth.srs-ssms.com/api/dev/list-items';

  constructor(private http: HttpClient) {}

  getItems() {
    return this.http.get<ExternalListResponse>(this.LIST_URL).pipe(
      map((res) => {
        if (res?.statusCode !== 1) return [];

        return (res.data ?? []).map((x): Item => ({
          id: String(x.id),
          name: x.item_name,
          stock: Number(x.stock), // convert string -> number
          unit: x.unit,
          source: 'api',
        }));
      })
    );
  }
}

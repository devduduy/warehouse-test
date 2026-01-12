import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Item } from '../models/item';

@Injectable({ providedIn: 'root' })
export class LocalItemsService {
  private BASE = 'http://localhost:3001/local-items';

  constructor(private http: HttpClient) {}

  getItems() {
    return this.http.get<any>(this.BASE).pipe(
      map((res) => {
        if (res?.status !== 1) return [];
        return res.data.map((x: any): Item => ({
          id: x.id,
          name: x.name,
          stock: x.stock,
          unit: x.unit,
          source: 'local',
        }));
      })
    );
  }

  create(item: Omit<Item, 'id' | 'source'>) {
    return this.http.post<any>(this.BASE, item);
  }

  update(id: string, item: Omit<Item, 'id' | 'source'>) {
    return this.http.put<any>(`${this.BASE}/${id}`, item);
  }

  remove(id: string) {
    return this.http.delete<any>(`${this.BASE}/${id}`);
  }
}

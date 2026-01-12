export type ItemSource = 'api' | 'local';

export interface Item {
  id: string;
  name: string;
  stock: number;
  unit: string;
  source: ItemSource;
}

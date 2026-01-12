import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

import { finalize, forkJoin } from 'rxjs';

import { Item } from '../../models/item';
import { ExternalItemsService } from '../../services/external-items';
import { LocalItemsService } from '../../services/local-items';
import { AuthService } from '../../services/auth';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ItemFormDialogComponent, ItemFormValue } from './item-form-dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';


@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule, 
    MatTableModule, 
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule, 
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    MatChipsModule
  ],
  templateUrl: './items.html',
  styleUrl: './items.scss',
})
export class ItemsComponent {
  private externalItems = inject(ExternalItemsService);
  private localItems = inject(LocalItemsService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private snack = inject(MatSnackBar);

  loading = false;
  error = '';

  items: Item[] = [];
  dataSource = new MatTableDataSource<Item>([]);
  filterValue = '';


  // kolom table
  displayedColumns: string[] = ['name', 'stock', 'unit', 'source', 'actions'];

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.error = '';

    forkJoin({
      api: this.externalItems.getItems(),
      local: this.localItems.getItems(),
    }).pipe(
      finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: ({ api, local }) => {
        // gabungkan: api dulu, local setelahnya
        this.items = [...api, ...local];
        this.dataSource.data = this.items;

        // re-apply filter kalau user lagi search
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
      },
      error: (err) => {
        console.error(err);
        this.error = 'Gagal load data items';
        this.loading = false;
      },
    });
  }

  applyFilter(value: string) {
    this.filterValue = value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
  

  addLocalItem() {
    const ref = this.dialog.open(ItemFormDialogComponent, {
      width: '420px',
      data: { title: 'Tambah Barang', value: null },
    });

    ref.afterClosed().subscribe((value: ItemFormValue | undefined) => {
      if (!value) return;

      this.localItems
        .create({ name: value.name, stock: value.stock, unit: value.unit })
        .pipe(
          finalize(() => {
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: () => {
            this.snack.open('Barang berhasil ditambahkan', 'OK', { duration: 2000 });
            this.refreshLocalOnly();
          },
          error: (err) => {
            console.error(err);
            this.snack.open('Gagal menambahkan barang', 'OK', { duration: 2500 });
          },
        });
    });
  }

  editLocalItem(row: Item) {
    const ref = this.dialog.open(ItemFormDialogComponent, {
      width: '420px',
      data: { title: 'Edit Barang', value: { name: row.name, stock: row.stock, unit: row.unit } },
    });

    ref.afterClosed().subscribe((value: ItemFormValue | undefined) => {
      if (!value) return;

      this.localItems
        .update(row.id, { name: value.name, stock: value.stock, unit: value.unit })
        .pipe(finalize(() => this.cdr.detectChanges()))
        .subscribe({
          next: () => {
            this.snack.open('Barang berhasil diupdate', 'OK', { duration: 2000 });
            this.refreshLocalOnly();
          },
          error: (err) => {
            console.error(err);
            this.snack.open('Gagal update barang', 'OK', { duration: 2500 });
          },
        });
    });
  }

  deleteLocalItem(row: Item) {
    const yes = confirm(`Hapus "${row.name}"?`);
    if (!yes) return;

    this.localItems
      .remove(row.id)
      .pipe(finalize(() => this.cdr.detectChanges()))
      .subscribe({
        next: () => {
          this.snack.open('Barang berhasil dihapus', 'OK', { duration: 2000 });
          this.refreshLocalOnly();
        },
        error: (err) => {
          console.error(err);
          this.snack.open('Gagal hapus barang', 'OK', { duration: 2500 });
        },
      });
  }

  private refreshLocalOnly() {
    this.localItems.getItems().subscribe({
      next: (local) => {
        const api = this.items.filter((x) => x.source === 'api');
        this.items = [...api, ...local];
        this.dataSource.data = this.items;
        this.dataSource.filter = this.filterValue.trim().toLowerCase();
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err),
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  //export CSV
  exportAllCsv() {
    this.downloadCsv(this.dataSource.filteredData, `items_all_${this.todayStamp()}.csv`);
  }
  
  exportLocalCsv() {
    const local = this.items.filter(x => x.source === 'local');
    this.downloadCsv(local, `items_local_${this.todayStamp()}.csv`);
  }
  
  private downloadCsv(rows: Item[], filename: string) {
    const header = ['id', 'name', 'stock', 'unit', 'source'];
  
    const escape = (v: unknown) => {
      const s = String(v ?? '');
      // CSV escape: kalau ada koma/quote/newline, bungkus dengan quote dan double quote di dalamnya
      const needsQuote = /[",\n\r]/.test(s);
      const escaped = s.replace(/"/g, '""');
      return needsQuote ? `"${escaped}"` : escaped;
    };
  
    const lines = [
      header.join(','),
      ...rows.map(r => [
        escape(r.id),
        escape(r.name),
        escape(r.stock),
        escape(r.unit),
        escape(r.source),
      ].join(',')),
    ];
  
    const csv = lines.join('\r\n');
  
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  
    URL.revokeObjectURL(url);
  }
  
  private todayStamp() {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}${pad(d.getMinutes())}`;
  }
  
}

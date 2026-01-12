import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

export interface ItemFormValue {
  name: string;
  stock: number;
  unit: string;
}

type DialogData = {
  title: string;
  value: ItemFormValue | null;
};

@Component({
  selector: 'app-item-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>

    <div mat-dialog-content>
      <form [formGroup]="form" class="form">
        <mat-form-field appearance="outline" class="full">
          <mat-label>Nama Barang</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Stok</mat-label>
          <input matInput type="number" formControlName="stock" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="full">
          <mat-label>Satuan</mat-label>
          <input matInput formControlName="unit" />
        </mat-form-field>
      </form>
    </div>

    <div mat-dialog-actions align="end">
      <button mat-button (click)="close()">Cancel</button>
      <button mat-raised-button [disabled]="form.invalid" (click)="save()">
        Save
      </button>
    </div>
  `,
  styles: [`
    .full { width: 100%; }
    .form { display: grid; gap: 12px; margin-top: 8px; }
  `],
})
export class ItemFormDialogComponent {
  data = inject<DialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<ItemFormDialogComponent>);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: [this.data.value?.name ?? '', Validators.required],
    stock: [this.data.value?.stock ?? 0, [Validators.required, Validators.min(0)]],
    unit: [this.data.value?.unit ?? '', Validators.required],
  });

  close() {
    this.ref.close();
  }

  save() {
    const v = this.form.value;
    this.ref.close({
      name: v.name!,
      stock: Number(v.stock),
      unit: v.unit!,
    } satisfies ItemFormValue);
  }
}

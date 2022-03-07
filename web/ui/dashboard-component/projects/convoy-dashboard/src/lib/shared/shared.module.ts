import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pipes } from './pipes';
import { FilterComponent } from './components/filter/filter.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
	declarations: [...pipes, FilterComponent],
	imports: [CommonModule, MatDatepickerModule, MatNativeDateModule, ReactiveFormsModule, FormsModule],
	exports: [...pipes, FilterComponent]
})
export class SharedModule {}
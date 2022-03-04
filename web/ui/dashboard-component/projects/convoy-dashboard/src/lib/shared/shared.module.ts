import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { pipes } from './pipes';
import { FiltersComponent } from './components/filters/filters.component';

@NgModule({
	declarations: [...pipes, FiltersComponent],
	imports: [CommonModule],
	exports: [...pipes]
})
export class SharedModule {}

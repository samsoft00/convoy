import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'date-filter',
	templateUrl: './date-filter.component.html',
	styleUrls: ['./date-filter.component.scss']
})
export class DateFilterComponent implements OnInit {
	dateRange: FormGroup = this.formBuilder.group({
		startDate: [{ value: null, disabled: true }],
		endDate: [{ value: null, disabled: true }]
	});
	@Output() selectedDateRange = new EventEmitter<any>();
	@Output() clearDates = new EventEmitter<any>();
	@Input('dateRangeValue') dateRangeValue?: {
		startDate: string | Date;
		endDate: string | Date;
	};
	maxDate = new Date();

	constructor(private formBuilder: FormBuilder, private route: ActivatedRoute) {}

	ngOnInit(): void {
		if (this.dateRangeValue) this.dateRange.patchValue(this.dateRangeValue);
	}

	setDate() {
		this.selectedDateRange.emit(this.dateRange.value);
	}

	clearDate(event?: any) {
		event?.stopPropagation();
		this.clearDates.emit();
		this.dateRange.patchValue({ startDate: '', endDate: '' });
	}
}

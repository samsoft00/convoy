import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fromEvent, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, startWith, switchMap } from 'rxjs/operators';
import { APP } from '../../../models/app.model';

@Component({
	selector: 'lib-filter',
	templateUrl: './filter.component.html',
	styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnInit {
	@Output() eventDeliveryStatusFilters = new EventEmitter<string[]>();
	@Output() dateRange = new EventEmitter<{ startDate: any; endDate: any }>();
	@Output() clearEventFilters = new EventEmitter<'events' | 'event deliveries' | 'apps'>();
	// @Output() updateEventDevliveryStatusFilters = new EventEmitter<{ status: string; isChecked: any }>();
	@Output() filterApps = new EventEmitter<string>();
	@Output() appFilter = new EventEmitter<{ appId: string; isChecked: any; activeSection: 'eventDels' | 'events' }>();

	//sure
	@Output() clearEventFilterForDeliveries = new EventEmitter<any>();
	// @Output() showOverlay = new EventEmitter<boolean>();

	// @Input() eventDeliveryFilteredByStatus!: string[];
	@Input() activeTab!: 'events' | 'event deliveries' | 'apps';
	@Input() filteredApps!: APP[];
	@Input() eventDeliveriesApp!: string;
	@Input() eventDeliveryFilteredByEventId!: string;
	@Input() eventDeliveriesStatusFilterActive!: boolean;
	statsDateRange: FormGroup = this.formBuilder.group({
		startDate: [{ value: new Date(new Date().setDate(new Date().getDate() - 30)), disabled: true }],
		endDate: [{ value: new Date(), disabled: true }]
	});
	eventsFilterDateRange: FormGroup = this.formBuilder.group({
		startDate: [{ value: '', disabled: true }],
		endDate: [{ value: '', disabled: true }]
	});
	filterEventDeliveriesFilterDateRange: FormGroup = this.formBuilder.group({
		startDate: [{ value: '', disabled: true }],
		endDate: [{ value: '', disabled: true }]
	});
	showOverlay = false;
	showEventDeliveriesStatusDropdown = false;
	showEventDeliveriesAppsDropdown = false;
	showEventsAppsDropdown = false;
	showEventFilterCalendar = false;
	eventDeliveryFilteredByStatus: string[] = [];
	eventDeliveryStatuses = ['Success', 'Failure', 'Retry', 'Scheduled', 'Processing', 'Discarded'];
	eventsAppsFilter$!: Observable<any>;
	eventsDelAppsFilter$!: Observable<any>;
	@ViewChild('eventsAppsFilter', { static: true }) eventsAppsFilter!: ElementRef;
	@ViewChild('eventDelsAppsFilter', { static: true }) eventDelsAppsFilter!: ElementRef;
	constructor(private formBuilder: FormBuilder) {}

	ngOnInit(): void {}

	ngAfterViewInit() {
		this.eventsAppsFilter$ = fromEvent<any>(this.eventsAppsFilter.nativeElement, 'keyup').pipe(
			map(event => event.target.value),
			startWith(''),
			debounceTime(500),
			distinctUntilChanged(),
			switchMap(search => this.getAppsForFilter(search))
		);
		this.eventsDelAppsFilter$ = fromEvent<any>(this.eventDelsAppsFilter.nativeElement, 'keyup').pipe(
			map(event => event.target.value),
			startWith(''),
			debounceTime(500),
			distinctUntilChanged(),
			switchMap(search => this.getAppsForFilter(search))
		);
	}
	checkIfEventDeliveryStatusFilterOptionIsSelected(status: string) {
		return this.eventDeliveryFilteredByStatus?.length > 0 ? this.eventDeliveryFilteredByStatus.includes(status) : false;
	}

	updateEventDevliveryStatusFilter(status: string, isChecked: any) {
		if (isChecked.target.checked && status) {
			this.eventDeliveryFilteredByStatus.push(status);
		} else {
			let index = this.eventDeliveryFilteredByStatus.findIndex(x => x === status);
			this.eventDeliveryFilteredByStatus.splice(index, 1);
		}
	}
	pushEventDeliveryStatusFilters() {
		console.log(this.eventDeliveryFilteredByStatus);
		this.eventDeliveryStatusFilters.emit(this.eventDeliveryFilteredByStatus);
	}

	async getAppsForFilter(search: string) {
		this.filterApps.emit(search);
	}

	updateAppFilter(appId: string, isChecked: any, activeSection: 'eventDels' | 'events') {
		const appFilter = {
			appId: appId,
			isChecked: isChecked,
			activeSection: activeSection
		};
		this.appFilter.emit(appFilter);
	}
	// date range filter
	filterData() {
		this.dateRange.emit(this.filterEventDeliveriesFilterDateRange.value);
	}

	// clear event filter on event deliveries tab
	clearEventFilter() {
		this.clearEventFilterForDeliveries.emit();
	}
	// clear all filters based on tab
	clearFilters(tableName: 'events' | 'event deliveries' | 'apps') {
		this.clearEventFilters.emit(tableName);
	}
}

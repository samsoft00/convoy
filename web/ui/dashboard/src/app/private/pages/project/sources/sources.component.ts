import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGINATION } from 'convoy-app/lib/models/global.model';
import { SOURCE } from 'src/app/models/group.model';
import { PrivateService } from 'src/app/private/private.service';
import { GeneralService } from 'src/app/services/general/general.service';
import { SourcesService } from './sources.service';

@Component({
	selector: 'app-sources',
	templateUrl: './sources.component.html',
	styleUrls: ['./sources.component.scss']
})
export class SourcesComponent implements OnInit {
	sourcesTableHead: string[] = ['Name', 'Type', 'Verifier', 'URL', 'Date created', ''];
	shouldShowCreateSourceModal = false;
	shouldShowUpdateSourceModal = false;
	activeSource?: SOURCE;
	sources!: { content: SOURCE[]; pagination: PAGINATION };
	isLoadingSources = false;
	projectId = this.privateService.activeProjectDetails.uid;
	sourceTypes = [
		{ value: 'http', viewValue: 'http' },
		{ value: 'rest_api', viewValue: 'Rest API' },
		{ value: 'pub_sub', viewValue: 'Pub/Sub' },
		{ value: 'db_change_stream', viewValue: 'Database' }
	];
	httpTypes = [
		{ value: 'hmac', viewValue: 'HMAC' },
		{ value: 'basic_auth', viewValue: 'Basic Auth' },
		{ value: 'api_key', viewValue: 'API Key' }
	];

	constructor(private route: ActivatedRoute, private router: Router, private sourcesService: SourcesService, public privateService: PrivateService, private generalService: GeneralService) {
		this.route.queryParams.subscribe(params => (this.activeSource = this.sources?.content.find(source => source.uid === params?.id)));

		const urlParam = route.snapshot.params.id;
		if (urlParam && urlParam === 'new') this.shouldShowCreateSourceModal = true;
		if (urlParam && urlParam !== 'new') this.shouldShowUpdateSourceModal = true;
	}

	getDataReadableValue(type: 'sourceType' | 'verifier', value: string): { value: string; viewValue: string } | null {
		if (type === 'sourceType') {
			return this.sourceTypes.find(source => source.value === value)!;
		}
		if (type === 'verifier') {
			return this.httpTypes.find(source => source.value === value)!;
		}
		return null;
	}

	ngOnInit() {
		this.getSources();
	}

	async getSources(requestDetails?: { page?: number }) {
		const page = requestDetails?.page || this.route.snapshot.queryParams.page || 1;
		this.isLoadingSources = true;
		try {
			const sourcesResponse = await this.privateService.getSources({ page });
			this.sources = sourcesResponse.data;
			if (this.sources.pagination.total > 0) this.activeSource = this.sources?.content.find(source => source.uid === this.route.snapshot.queryParams?.id);
			this.isLoadingSources = false;
		} catch (error) {
			this.isLoadingSources = false;
			return error;
		}
	}

	async deleteSource() {
		try {
			await this.sourcesService.deleteSource(this.activeSource?.uid);
			this.getSources();
			this.router.navigateByUrl('./');
			this.activeSource = undefined;
		} catch (error) {
			console.log(error);
		}
	}

	closeCreateSourceModal() {
		this.generalService.showNotification({ message: `Source ${this.shouldShowUpdateSourceModal ? 'updat' : 'creat'}ed successfully`, style: 'success' });
		this.router.navigateByUrl('/projects/' + this.projectId + '/sources');
	}

	copyText(text: string, sourceName: string, event: any) {
		event.stopPropagation();
		const el = document.createElement('textarea');
		el.value = text;
		document.body.appendChild(el);
		el.select();
		document.execCommand('copy');
		this.generalService.showNotification({ message: `${sourceName} URL has been copied to clipboard`, style: 'info' });
		document.body.removeChild(el);
	}
}

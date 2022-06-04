import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PAGINATION } from 'convoy-app/lib/models/global.model';
import { SOURCE } from 'src/app/models/group.model';
import { SourcesService } from './sources.service';

@Component({
	selector: 'app-sources',
	templateUrl: './sources.component.html',
	styleUrls: ['./sources.component.scss']
})
export class SourcesComponent implements OnInit {
	sourcesTableHead: string[] = ['Source name', 'Source type', 'Verifier', 'URL', 'Date created', ''];
	shouldShowCreateSourceModal = this.router.url.split('/')[4] === 'new';
	activeSource?: SOURCE;
	sources!: { content: SOURCE[]; pagination: PAGINATION };
	isLoadingSources = false;

	constructor(private route: ActivatedRoute, private router: Router, private sourcesService: SourcesService, private location: Location) {
		this.route.queryParams.subscribe(params => {
			this.activeSource = this.sources?.content.find(source => source.uid === params?.id);
		});
	}

	ngOnInit() {
		this.getSources();
	}

	goBack() {
		this.location.back();
	}

	async getSources(requestDetails?: { page?: number }) {
		const page = requestDetails?.page || this.route.snapshot.queryParams.page || 1;
		this.isLoadingSources = true;
		try {
			const sourcesResponse = await this.sourcesService.getSources({ page });
			this.sources = sourcesResponse.data;
			this.isLoadingSources = false;
			this.activeSource = this.sources?.content.find(source => source.uid === this.route.snapshot.queryParams?.id);
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
}
import { Component, OnInit } from '@angular/core';
import { GROUP } from 'src/app/models/group.model';
import { HTTP_RESPONSE } from 'src/app/models/http.model';
import { ProjectsService } from './projects.service';

@Component({
	selector: 'app-projects',
	templateUrl: './projects.component.html',
	styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
	isLoadingProjects: boolean = false;
	groups: GROUP[] = [];
	groupsLoaderIndex: number[] = [0, 1, 2, 3, 4];
	constructor(private projectsService: ProjectsService) {}

	async ngOnInit() {
		await this.getGroups();
	}

	async getGroups(): Promise<HTTP_RESPONSE> {
		this.isLoadingProjects = true;

		try {
			const groupsResponse = await this.projectsService.getGroups();
			this.groups = groupsResponse.data;
			console.log(this.groups);
			this.isLoadingProjects = false;
			return groupsResponse;
		} catch (error: any) {
			this.isLoadingProjects = false;
			return error;
		}
	}
}

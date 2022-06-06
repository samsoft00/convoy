import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { GROUP } from 'src/app/models/group.model';
import { TEAMS } from 'src/app/models/teams.model';
import { GeneralService } from 'src/app/services/general/general.service';
import { TeamsService } from './teams.service';

@Component({
	selector: 'app-teams',
	templateUrl: './teams.component.html',
	styleUrls: ['./teams.component.scss']
})
export class TeamsComponent implements OnInit {
	tableHead: string[] = ['Name', 'Role', 'Projects', 'Status', ''];
	showInviteTeamMemberModal: boolean = false;
	showTeamMemberDropdown: boolean = false;
	showTeamGroupDropdown: boolean = false;
	showSuccessModal: boolean = false;
	showDeactivateModal: boolean = false;
	selectedMember!: TEAMS;
	loading: boolean = false;
	noData: boolean = false;
	noSearch: boolean = false;
	searchMode: boolean = false;
	deactivatingUser: boolean = false;
	searchingMembers: boolean = false;
	searchText!: string;
	teams!: TEAMS[];
	groups: GROUP[] = [];
	filteredGroups: GROUP[] = [];
	selectedGroups: GROUP[] = [];
	noOfSelectedGroups: string = '0 Projects';
	invitingUser: boolean = false;
	currentId!: string;
	showCreateGroupModal: boolean = false;
	showOverlay: boolean = false;
	inviteUserForm: FormGroup = this.formBuilder.group({
		firstname: ['', Validators.required],
		lastname: ['', Validators.required],
		email: ['', Validators.compose([Validators.required, Validators.email])],
		role: ['', Validators.required],
		groups: [[], Validators.required]
	});

	constructor(private formBuilder: FormBuilder, private generalService: GeneralService, private teamService: TeamsService) {}

	async ngOnInit() {
		await Promise.all([this.fetchTeamMembers(), this.getProjects()]);
	}

	async fetchTeamMembers() {
		this.loading = true;
		this.noSearch = false;
		this.searchMode = false;
		try {
			const response = await this.teamService.getTeamMembers();
			if (response.data.length) this.teams = response.data;
			response.data.length ? (this.noData = false) : (this.noData = true);

			this.loading = false;
		} catch {
			this.loading = false;
		}
	}

	async getProjects() {
		try {
			const response = await this.teamService.getProjects();
			const groupsAvailable = response.data;
			groupsAvailable.forEach((element: GROUP) => {
				this.groups.push({
					...element,
					selected: false
				});
			});
			this.filteredGroups = this.groups;
		} catch {}
	}

	searchGroup(searchInput: any) {
		const searchString = searchInput.target.value;
		if (searchString) {
			this.filteredGroups = this.groups.filter(element => {
				let filteredGroups = element.name.toLowerCase();
				return filteredGroups.includes(searchString);
			});
		} else {
			this.filteredGroups = this.groups;
		}
	}

	async searchTeam(searchInput: any) {
		this.searchMode = true;
		const searchString = searchInput;
		this.searchText = searchString;
		const requestOptions = {
			query: `?query=${searchString}`
		};
		this.searchingMembers = true;
		try {
			const response = await this.teamService.searchTeamMembers(requestOptions);
			if (response.data.length) this.teams = response.data;
			response.data.length ? (this.noSearch = false) : (this.noSearch = true);
			this.searchingMembers = false;
		} catch {
			this.searchingMembers = false;
		}
	}

	selectGroup(group: GROUP) {
		const id = group.uid;
		if (this.selectedGroups?.length) {
			const groupExists = this.selectedGroups.find(item => item.uid == id);
			if (groupExists) {
				this.selectedGroups = this.selectedGroups.filter(group => group.uid != id);
				this.filteredGroups.forEach((item: GROUP) => {
					if (item.uid == id) item.selected = false;
				});
			} else {
				this.selectedGroups.push(group);
				this.filteredGroups.forEach((item: GROUP) => {
					if (item.uid == id) item.selected = true;
				});
			}
		} else {
			this.selectedGroups.push(group);
			this.filteredGroups.forEach((item: GROUP) => {
				if (item.uid == id) item.selected = true;
			});
		}

		this.noOfSelectedGroups = `${this.selectedGroups?.length} project${this.selectedGroups?.length == 1 ? '' : 's'}`;
	}
	async inviteUser() {
		const groupIds = this.selectedGroups.map(item => item.uid);
		this.inviteUserForm.patchValue({
			groups: groupIds
		});
		if (this.inviteUserForm.invalid) {
			(<any>this.inviteUserForm).values(this.inviteUserForm.controls).forEach((control: FormControl) => {
				control?.markAsTouched();
			});
			return;
		}
		this.invitingUser = true;
		try {
			const response = await this.teamService.inviteUserToOrganisation(this.inviteUserForm.value);
			if (response.data) this.showSuccessModal = true;
			this.showInviteTeamMemberModal = false;
			this.inviteUserForm.reset();
			this.fetchTeamMembers();
			this.invitingUser = false;
		} catch {
			this.invitingUser = false;
		}
	}

	async deactivateMember() {
		this.deactivatingUser = true;
		const requestOptions = {
			memberId: this.selectedMember?.id
		};
		try {
			const response = await this.teamService.deactivateTeamMember(requestOptions);
			if (response.status) this.showDeactivateModal = false;
			this.generalService.showNotification({ style: 'success', message: response.message });
			this.fetchTeamMembers();
			this.deactivatingUser = false;
		} catch {
			this.deactivatingUser = false;
		}
	}

	showDropdown(id: string) {
		if (this.currentId == id) {
			this.currentId = '';
		} else {
			this.currentId = id;
		}
	}
	closeCreateGroupModal(fetchGroups: boolean) {
		this.showCreateGroupModal = false;
		if (fetchGroups) this.getProjects();
	}
}

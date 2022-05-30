import { Injectable } from '@angular/core';
import { HTTP_RESPONSE } from 'src/app/models/http.model';
import { HttpService } from 'src/app/services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {

  constructor(private http:HttpService) { }


	async getGroups(): Promise<HTTP_RESPONSE> {
		return new Promise(async (resolve, reject) => {
			try {
				const groupsResponse = await this.http.request({
					url: '/groups',
					method: 'get'
				});

				// this.activeGroupId = groupsResponse.data[0].uid;
				return resolve(groupsResponse);
			} catch (error: any) {
				return reject(error);
			}
		});
	}

}

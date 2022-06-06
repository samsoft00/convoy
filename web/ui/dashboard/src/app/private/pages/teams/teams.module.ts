import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TeamsComponent } from './teams.component';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CreateAppModule } from '../../components/create-app/create-app.module';

const routes: Routes = [{ path: '', component: TeamsComponent }];

@NgModule({
	declarations: [TeamsComponent],
	imports: [CommonModule, CreateAppModule, ReactiveFormsModule, FormsModule, RouterModule.forChild(routes)]
})
export class TeamsModule {}

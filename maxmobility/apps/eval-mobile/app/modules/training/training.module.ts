import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
import { SharedModule } from '../shared/shared.module';
import { TrainingComponent } from './training.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [{ path: '', component: TrainingComponent }];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes), SharedModule, TranslateModule],
  declarations: [TrainingComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class TrainingModule {}

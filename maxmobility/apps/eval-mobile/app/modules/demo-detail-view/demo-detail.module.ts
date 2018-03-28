import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
import { DemoDetailViewComponent } from './demo-detail-view.component';
import { SharedModule } from '../shared/shared.module';

const routes: Routes = [{ path: '', component: DemoDetailViewComponent }];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes), SharedModule],
  declarations: [DemoDetailViewComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class DemosModule {}

import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { Routes } from '@angular/router';
import { NativeScriptRouterModule } from 'nativescript-angular/router';
import { SharedModule } from '../shared/shared.module';
import { EvalsComponent } from './evals.component';
import { TranslateModule } from '@ngx-translate/core';

const routes: Routes = [{ path: '', component: EvalsComponent }];

@NgModule({
  imports: [NativeScriptRouterModule.forChild(routes), SharedModule, TranslateModule],
  declarations: [EvalsComponent],
  schemas: [NO_ERRORS_SCHEMA]
})
export class EvalsModule {}

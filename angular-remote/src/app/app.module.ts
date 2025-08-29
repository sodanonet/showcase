import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { RemoteComponent } from './remote-component/remote-component.component';
import { DataTableComponent } from './data-table/data-table.component';
import { AngularFeaturesComponent } from './angular-features/angular-features.component';

@NgModule({
  declarations: [
    AppComponent,
    RemoteComponent,
    DataTableComponent,
    AngularFeaturesComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
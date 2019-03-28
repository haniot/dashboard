import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MultiSelectModule } from 'primeng/multiselect';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';

import { PatientFormComponent } from './patient-form/patient-form.component';
import { PatientTableComponent } from './patient-table/patient-table.component';
import { PatientComponentComponent } from './patient-component/patient-component.component';
import { PatientService } from './services/patient.service';
import { PatientRoutingModule } from './patient-routing/patient-routing.module';
import { SharedModule } from 'app/shared/shared.module';
import { ListPilotstudiesComponent } from './list-pilotstudies/list-pilotstudies.component';

@NgModule({
  declarations: [
    PatientFormComponent,
    PatientTableComponent,
    PatientComponentComponent,
    ListPilotstudiesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    MatPaginatorModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MultiSelectModule,
    PatientRoutingModule
  ],
  providers: [
    PatientService,
    {provide: MAT_DATE_LOCALE, useValue: 'pt-BR'}
  ]
})
export class PatientModule { }

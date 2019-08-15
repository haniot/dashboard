import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { ISubscription } from 'rxjs/Subscription';
import { TranslateService } from '@ngx-translate/core';

import { PilotStudyService } from '../services/pilot.study.service';
import { Patient } from '../../patient/models/patient'
import { GenericUser } from '../../../shared/shared.models/generic.user'
import { PatientService } from '../../patient/services/patient.service'
import { HealthProfessional } from '../../admin/models/health.professional'
import { HealthProfessionalService } from '../../admin/services/health.professional.service'
import { AuthService } from '../../../security/auth/services/auth.service'

@Component({
    selector: 'pilot-study-form',
    templateUrl: './pilot.study.form.component.html',
    styleUrls: ['./pilot.study.form.component.scss']
})
export class PilotStudyFormComponent implements OnInit, OnChanges, OnDestroy {
    @Input() pilotStudyId: string;
    pilotStudyForm: FormGroup;
    professionalsForm: FormGroup;
    listProf: Array<HealthProfessional> = [];
    professionalsNotAssociated: Array<HealthProfessional> = [];
    professionalsAssociated: Array<HealthProfessional> = [];
    color = 'accent';
    checked = false;
    disabled = false;
    typeUserLogged: string;
    patientForm: FormGroup;
    listPatients: Array<Patient> = [];
    patientsNotAssociated: Array<Patient> = [];
    patientsAssociated: Array<Patient> = [];
    private subscriptions: Array<ISubscription>;

    constructor(
        private fb: FormBuilder,
        private pilotStudyService: PilotStudyService,
        private healthService: HealthProfessionalService,
        private patientService: PatientService,
        private toastService: ToastrService,
        private router: Router,
        private activeRouter: ActivatedRoute,
        private _location: Location,
        private authService: AuthService,
        private translateService: TranslateService
    ) {
        this.professionalsAssociated = new Array<HealthProfessional>();
        this.professionalsNotAssociated = new Array<HealthProfessional>();
        this.patientsAssociated = new Array<Patient>();
        this.patientsNotAssociated = new Array<Patient>();
        this.listProf = new Array<HealthProfessional>();
        this.listPatients = new Array<Patient>();
        this.subscriptions = new Array<ISubscription>();
    }

    ngOnInit() {
        this.typeUserLogged = this.authService.decodeToken().sub_type;
        this.subscriptions.push(this.activeRouter.paramMap.subscribe((params) => {
            this.pilotStudyId = params.get('pilotStudyId');
            if (this.pilotStudyId) {
                this.createForm();
                this.getPilotStudy();
            }
            if (this.typeUserLogged && this.typeUserLogged === 'admin') {
                this.getListProfessionals();
                this.getListPatients();
                this.loadProfessionalsAssociated();
                this.loadPatientsAssociated();
            }
        }));
        this.createForm();
        this.getPilotStudy();
        if (this.typeUserLogged && this.typeUserLogged === 'admin') {
            this.getListProfessionals();
            this.getListPatients();
        }
    }

    getPilotStudy() {
        if (this.pilotStudyId) {
            this.pilotStudyService.getById(this.pilotStudyId)
                .then(res => this.pilotStudyForm.setValue(res))
                .catch(() => {
                    this.toastService.error(this.translateService.instant('TOAST-MESSAGES.STUDY-NOT-FIND'));
                })
        }
    }

    createForm() {
        if (this.pilotStudyId) {
            this.pilotStudyForm = this.fb.group({
                id: [''],
                name: ['', Validators.required],
                location: ['', Validators.required],
                start: ['', Validators.required],
                end: ['', Validators.required],
                total_health_professionals: ['0'],
                total_patients: ['0'],
                is_active: [true, Validators.required]
            });
        } else {
            this.pilotStudyForm = this.fb.group({
                id: [''],
                name: ['', Validators.required],
                location: [''],
                start: ['', Validators.required],
                end: [{ value: '', disabled: true }, Validators.required],
                total_health_professionals: ['0'],
                total_patients: ['0'],
                is_active: [true, Validators.required]
            });
        }
        this.professionalsForm = this.fb.group({
            health_professionals_id_add: ['', Validators.required]
        });

        this.patientForm = this.fb.group({
            patients_id_add: ['', Validators.required]
        });

        this.subscriptions.push(this.pilotStudyForm.get('start').valueChanges.subscribe(val => {
            this.pilotStudyForm.get('end').enable();
        }));
    }

    onSubmit() {
        const form = this.pilotStudyForm.getRawValue();
        if (!this.pilotStudyId) {
            this.pilotStudyService.create(form)
                .then(pilotStudy => {
                    this.pilotStudyForm.reset();
                    this.toastService.info(this.translateService.instant('TOAST-MESSAGES.STUDY-CREATED'));
                })
                .catch(() => {
                    this.toastService.error(this.translateService.instant('TOAST-MESSAGES.STUDY-NOT-CREATED'));
                });
        } else {
            this.pilotStudyService.update(form)
                .then(() => {
                    this.toastService.info(this.translateService.instant('TOAST-MESSAGES.STUDY-UPDATED'));
                })
                .catch(() => {
                    this.toastService.error(this.translateService.instant('TOAST-MESSAGES.STUDY-NOT-UPDATED'));
                });
        }
    }

    ngOnChanges() {
        this.createForm();
        this.getPilotStudy();
    }

    onBack() {
        this._location.back();
    }

    getListProfessionals(): Promise<any> {
        return this.healthService.getAll()
            .then(httpResponse => {
                if (httpResponse.body && httpResponse.body.length) {
                    this.listProf = httpResponse.body;
                }

            })
            .catch();
    }

    getListPatients(): Promise<any> {
        return this.patientService.getAll()
            .then(httpResponse => {
                if (httpResponse.body && httpResponse.body.length) {
                    this.listPatients = httpResponse.body;
                }

            })
            .catch();
    }

    dissociateHealthProfessional(health_professionals_id: string) {
        this.pilotStudyService.dissociateHealthProfessionalsFromPilotStudy(this.pilotStudyId, health_professionals_id)
            .then(() => {
                this.loadProfessionalsAssociated();
                this.toastService.info(this.translateService.instant('TOAST-MESSAGES.HEALTHPROFESSIONAL-REMOVED'));
            })
            .catch(() => {
                this.toastService.error(this.translateService.instant('TOAST-MESSAGES.HEALTHPROFESSIONAL-NOT-REMOVED'));
            });
    }

    addProfessionalInStudy() {
        const healthProfessional_id_add = this.professionalsForm.get('health_professionals_id_add').value;
        this.pilotStudyService.addHealthProfessionalsToPilotStudy(this.pilotStudyId, healthProfessional_id_add)
            .then(() => {
                this.professionalsForm.reset();
                this.loadProfessionalsAssociated();
                this.toastService.info(this.translateService.instant('TOAST-MESSAGES.HEALTHPROFESSIONAL-ADD'));
            })
            .catch(() => {
                this.toastService.error(this.translateService.instant('TOAST-MESSAGES.HEALTHPROFESSIONAL-NOT-ADD'));
            });
    }

    loadProfessionalsAssociated() {
        if (this.pilotStudyId) {
            this.pilotStudyService.getHealthProfessionalsByPilotStudyId(this.pilotStudyId)
                .then(professionals => {
                    this.professionalsAssociated = professionals
                    this.loadProfessionalsNotAssociated();
                })
                .catch();
        }
    }

    loadProfessionalsNotAssociated() {
        this.professionalsNotAssociated = [];
        this.professionalsNotAssociated = this.listProf
            .filter(professional => !this.search(this.professionalsAssociated, professional));
    }

    dissociatePatientProfessional(patientId: string) {
        this.pilotStudyService.dissociatePatientFromPilotStudy(this.pilotStudyId, patientId)
            .then(() => {
                this.loadPatientsAssociated();
                this.toastService.info(this.translateService.instant('TOAST-MESSAGES.PATIENT-REMOVED'));
            })
            .catch(() => {
                this.toastService.error(this.translateService.instant('TOAST-MESSAGES.PATIENT-NOT-REMOVED'));
            });
    }

    addPatientInStudy() {
        const patietId = this.patientForm.get('patients_id_add').value;
        this.pilotStudyService.addPatientToPilotStudy(this.pilotStudyId, patietId)
            .then(() => {
                this.patientForm.reset();
                this.loadPatientsAssociated();
                this.toastService.info(this.translateService.instant('TOAST-MESSAGES.PATIENT-ADD'));
            })
            .catch(() => {
                this.toastService.error(this.translateService.instant('TOAST-MESSAGES.PATIENT-NOT-ADD'));
            });
    }

    loadPatientsAssociated() {
        if (this.pilotStudyId) {
            this.pilotStudyService.getPatientsByPilotStudy(this.pilotStudyId)
                .then(patients => {
                    this.patientsAssociated = patients;
                    this.loadPatientsNotAssociated();
                })
                .catch();
        }
    }

    loadPatientsNotAssociated() {
        this.patientsNotAssociated = [];
        this.patientsNotAssociated = this.listPatients
            .filter(patient => !this.search(this.patientsAssociated, patient));
    }

    private search(list: Array<GenericUser>, item: GenericUser): boolean {
        return !!list.find(element => {
            return element.id === item.id;
        });
    }

    trackById(index, item) {
        return item.id;
    }

    ngOnDestroy(): void {
        this.subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
    }
}
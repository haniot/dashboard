import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DatePipe, Location} from '@angular/common';

import {ToastrService} from 'ngx-toastr';

import {NutritionEvaluationService} from '../services/nutrition-evaluation.service';
import {NutritionEvaluation, NutritionalCouncil} from '../models/nutrition-evaluation';
import {ModalService} from 'app/shared/shared-components/haniot-modal/service/modal.service';
import {GraphService} from 'app/shared/shared-services/graph.service';
import {PatientService} from 'app/modules/patient/services/patient.service';
import {Patient} from 'app/modules/patient/models/patient';
import {Weight} from 'app/modules/measurement/models/wieght';
import {Measurement, IMeasurement, MeasurementType} from 'app/modules/measurement/models/measurement';
import {BloodPressure} from 'app/modules/measurement/models/blood-pressure';
import {HeartRate} from 'app/modules/measurement/models/heart-rate';

@Component({
    selector: 'app-nutrition-evaluation',
    templateUrl: './nutrition-evaluation.component.html',
    styleUrls: ['./nutrition-evaluation.component.scss']
})
export class NutritionEvaluationComponent implements OnInit {

    typeCousenling = ['Estado Nutricional', 'Resistência a insulina / Diabetes', 'Hipertensão'];

    nutritionalEvaluation: NutritionEvaluation;

    nutritionEvaluationId: string;

    option = {
        title: {
            text: 'Medições coletas',
        },
        tooltip: {
            formatter: "Frequência: {c} bpm <br> Data: {b}",
            trigger: 'axis'
        },
        xAxis: {
            data: []
        },
        yAxis: {
            splitLine: {
                show: false
            },
            axisLabel: {
                formatter: '{value} bpm'
            }
        },
        dataZoom: [
            {
                type: 'slider'
            }
        ],
        series: [
            {
                type: 'line',
                data: []
            }
        ]
    };

    patientId: string;
    patient: Patient;

    sharedEmail: boolean;

    ncSuggested: NutritionalCouncil;
    ncDefinitive: NutritionalCouncil;

    finalCounseling = "";

    allCounselings = false;

    listChecksBmiWhr: Array<boolean>;
    listChecksGlycemia: Array<boolean>;
    listChecksBloodPressure: Array<boolean>;

    listWeight: Array<IMeasurement>;
    listHeight: Array<IMeasurement>;
    listFat: Array<IMeasurement>;
    listWaistCircunference: Array<IMeasurement>;
    listBodyTemperature: Array<IMeasurement>;
    listBloodGlucose: Array<IMeasurement>;
    listBloodPressure: Array<BloodPressure>;
    listHeartRate: Array<HeartRate>;

    newCounseling = "";
    newCounselingType = "bmi_whr";

    finalingEvaluantion = false;


    constructor(
        private nutritionService: NutritionEvaluationService,
        private activeRouter: ActivatedRoute,
        private datePipe: DatePipe,
        private modalService: ModalService,
        private location: Location,
        private graphService: GraphService,
        private patientService: PatientService,
        private toastService: ToastrService,
        private nutritionEvaluationService: NutritionEvaluationService
    ) {

        this.ncSuggested = new NutritionalCouncil();
        this.ncDefinitive = new NutritionalCouncil();


        this.patient = new Patient();

        this.nutritionalEvaluation = new NutritionEvaluation();
        this.listChecksBmiWhr = new Array<boolean>();
        this.listChecksGlycemia = new Array<boolean>();
        this.listChecksBloodPressure = new Array<boolean>();

        this.listWeight = new Array<Weight>();
        this.listHeight = new Array<IMeasurement>();
        this.listFat = new Array<IMeasurement>();
        this.listWaistCircunference = new Array<IMeasurement>();
        this.listBodyTemperature = new Array<IMeasurement>();
        this.listBloodGlucose = new Array<IMeasurement>();
        this.listBloodPressure = new Array<BloodPressure>();
        this.listHeartRate = new Array<HeartRate>();
    }

    ngOnInit() {
        this.activeRouter.paramMap.subscribe((params) => {
            this.patientId = params.get('patient_id');
            this.nutritionEvaluationId = params.get('nutritionevaluation_id');
            this.getNutritionEvaluation();
        });
        this.getNutritionEvaluation();
    }

    getNutritionEvaluation() {
        this.nutritionService.getById(this.patientId, this.nutritionEvaluationId)
            .then(nutritionEvaluation => {
                // console.log(nutritionEvaluation)
                this.nutritionalEvaluation = nutritionEvaluation;
                this.formatCounseling()
                this.loadGraph(nutritionEvaluation.heart_rate.dataset);
                this.separateMeasurements();
                this.getPatient();
            })
            .catch(erroResponse => {
                this.toastService.error("Não foi possível carregar avaliação nutricional!");
                // console.log('Não foi possível carregar avaliação!', erroResponse);
            });

        this.patientService.getById(this.patientId)
            .then(patient => {
                this.patient = patient;
            })
            .catch(errorResponse => {
                this.toastService.error('Não foi possível identificar o paciente!')
                // console.log('Não foi possível buscar paciente!', errorResponse);
            });
    }

    formatCounseling() {

        this.listChecksBmiWhr = new Array<boolean>();
        this.listChecksGlycemia = new Array<boolean>();
        this.listChecksBloodPressure = new Array<boolean>();

        this.finalCounseling = "";

        this.ncSuggested = this.nutritionalEvaluation.counseling.suggested;
        this.ncDefinitive = this.nutritionalEvaluation.counseling.definitive;


        this.ncSuggested.bmi_whr.forEach((counseling, index) => {
            if (index === this.ncSuggested.bmi_whr.length - 1) {
                this.finalCounseling += '\t' + (index + 1) + ". " + counseling;
            } else {
                this.finalCounseling += '\t' + (index + 1) + ". " + counseling + '\n\n';
            }
            this.listChecksBmiWhr.push(false);
        });

        this.ncSuggested.glycemia.forEach((counseling, index) => {
            if (index === this.ncSuggested.glycemia.length - 1) {
                this.finalCounseling += '\t' + (index + 1) + ". " + counseling;
            } else {
                this.finalCounseling += '\t' + (index + 1) + ". " + counseling + '\n\n';
            }
            this.listChecksGlycemia.push(false);
        });

        this.ncSuggested.blood_pressure.forEach((counseling, index) => {
            if (index === this.ncSuggested.blood_pressure.length - 1) {
                this.finalCounseling += '\t' + (index + 1) + ". " + counseling;
            } else {
                this.finalCounseling += '\t' + (index + 1) + ". " + counseling + '\n\n';
            }
            this.listChecksBloodPressure.push(false);
        });

    }

    loadGraph(dataset: Array<any>) {

        // console.log(dataset);
        if (dataset && dataset.length > 0) {
            // Limpando o grafico
            this.option.xAxis.data = [];
            this.option.series[0].data = [];

            dataset.forEach((date: { value: number, timestamp: string }) => {

                this.option.xAxis.data.push(this.datePipe.transform(date.timestamp, "shortDate"));

                this.option.series[0].data.push(date.value);

            });

            this.graphService.refreshGraph();
        }

    }

    getPatient(): void {
        this.patient = this.nutritionalEvaluation.patient;

    }

    finalizeEvaluation() {

        this.modalService.open('finalingEvaluantion');

        const counselingBwr: Array<number> = new Array<number>();
        this.listChecksBmiWhr.forEach((element, index) => {
            if (element === true) {
                counselingBwr.push(index);
            }
        });

        const counselingGlycemia: Array<number> = new Array<number>();
        this.listChecksGlycemia.forEach((element, index) => {
            if (element === true) {
                counselingGlycemia.push(index);
            }
        });

        const counselingBlood: Array<number> = new Array<number>();
        this.listChecksBloodPressure.forEach((element, index) => {
            if (element === true) {
                counselingBlood.push(index);
            }
        });

        const nutritionalCouncil: NutritionalCouncil = new NutritionalCouncil();

        counselingBwr.forEach(element => {
            nutritionalCouncil.bmi_whr.push(this.ncSuggested.bmi_whr[element])
        });
        counselingGlycemia.forEach(element => {
            nutritionalCouncil.glycemia.push(this.ncSuggested.glycemia[element])
        });
        counselingBlood.forEach(element => {
            nutritionalCouncil.blood_pressure.push(this.ncSuggested.blood_pressure[element])
        });


        this.nutritionEvaluationService.finalize(this.nutritionalEvaluation.id, this.nutritionalEvaluation.patient.id, nutritionalCouncil)
            .then(nutritionEvaluation => {
                this.getNutritionEvaluation();
                this.toastService.info("Avaliação finalizada com sucesso!");
                setTimeout(() => {
                    this.modalService.close('finalingEvaluantion');
                }, 2000)
            })
            .catch(errorResponse => {
                setTimeout(() => {
                    this.modalService.close('finalingEvaluantion');
                }, 2000)
                this.toastService.error("Não foi possível atualizar avaliação!");
                // console.log("Não foi possível atualizar avaliação!", errorResponse);
            });
    }

    onBack() {
        this.location.back();
    }

    clickCheckAll() {
        this.listChecksBmiWhr.forEach((element, index) => {
            this.listChecksBmiWhr[index] = !this.allCounselings;
        });

        this.listChecksGlycemia.forEach((element, index) => {
            this.listChecksGlycemia[index] = !this.allCounselings;
        });

        this.listChecksBloodPressure.forEach((element, index) => {
            this.listChecksBloodPressure[index] = !this.allCounselings;
        });
    }

    allChecksDisabled(): boolean {
        const findBmi = this.listChecksBmiWhr.find(element => {
            return element === true;
        });

        const findGlycemia = this.listChecksGlycemia.find(element => {
            return element === true;
        });

        const findBlood = this.listChecksBloodPressure.find(element => {
            return element === true;
        });


        return !(findBmi || findGlycemia || findBlood);
    }

    separateMeasurements(): void {
        const measurements: Array<any> = this.nutritionalEvaluation.measurements;

        this.listWeight = measurements.filter((element: Weight) => {
            return element.type === MeasurementType.weight
        });

        this.listHeight = measurements.filter((element: Measurement) => {
            return element.type === MeasurementType.height
        });

        this.listFat = measurements.filter((element: Measurement) => {
            return element.type === MeasurementType.fat
        });

        this.listWaistCircunference = measurements.filter((element: Measurement) => {
            return element.type === MeasurementType.waist_circumference
        });

        this.listBodyTemperature = measurements.filter((element: Measurement) => {
            return element.type === MeasurementType.body_temperature
        });

        this.listBloodGlucose = measurements.filter((element: Measurement) => {
            return element.type === MeasurementType.blood_glucose
        });

        this.listBloodPressure = measurements.filter((element: Measurement) => {
            return element.type === MeasurementType.blood_pressure
        });

        this.listHeartRate = measurements.filter((element: Measurement) => {
            return element.type === MeasurementType.heart_rate
        });
    }

    showNewCounseling(): void {
        this.modalService.open('newCounseling');
    }

    hiddenNewCounseling(): void {
        this.modalService.close('newCounseling');
        this.newCounseling = "";
        this.newCounselingType = 'bmi_whr';
    }

    addNewCounseling(): void {

        switch (this.newCounselingType) {
            case "bmi_whr":
                this.ncSuggested.bmi_whr.push(this.newCounseling);
                this.listChecksBmiWhr[this.ncSuggested.bmi_whr.length - 1] = true;
                break;
            case "glycemia":
                this.ncSuggested.glycemia.push(this.newCounseling);
                this.listChecksGlycemia[this.ncSuggested.glycemia.length - 1] = true;
                break;
            case "blood_pressure":
                this.ncSuggested.blood_pressure.push(this.newCounseling);
                this.listChecksBloodPressure[this.ncSuggested.blood_pressure.length - 1] = true;
                break;
            default:
                this.toastService.error("Não foi possível adicionar conselho!");
                break;
        }
        this.hiddenNewCounseling();

    }

    sendEvaluationViaEmail(): void {
        this.nutritionService.sendNutritionalEvaluationViaEmail(this.patient, this.nutritionalEvaluation)
            .then(() => {
                this.toastService.info('Avaliação enviada com sucesso!');
            })
            .catch(err => {
                this.toastService.error('Não foi possível enviar avaliação com sucesso!');
            });
    }

}
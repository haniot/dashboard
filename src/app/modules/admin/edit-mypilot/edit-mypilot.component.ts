import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

import { ToastrService } from 'ngx-toastr';

import { PilotStudyService } from 'app/modules/pilot-study/services/pilot-study.service';

@Component({
  selector: 'app-edit-mypilot',
  templateUrl: './edit-mypilot.component.html',
  styleUrls: ['./edit-mypilot.component.scss']
})
export class EditMypilotComponent implements OnInit {

  pilotStudyForm: FormGroup;
  professionalsForm: FormGroup;

  multiSelectProfissionais: Array<any> = new Array<any>();
  multiSelectProfissionaisSelected: Array<any> = new Array<any>();
  color = 'accent';
  checked = false;
  disabled = false;

  pilotStudyId: string;

  constructor(
    private fb: FormBuilder,
    private pilotStudyService: PilotStudyService,
    private toastService: ToastrService,
    private router: Router,
    private activeRouter: ActivatedRoute,
    private location: Location
  ) {

  }

  ngOnInit() {
    this.activeRouter.paramMap.subscribe((params) => {
      this.pilotStudyId = params.get('pilotstudy_id');
      if (this.pilotStudyId) {
        this.createForm();
        this.getPilotStudy();
      }
    });
    this.createForm();
    this.getPilotStudy();
  }

  getPilotStudy() {
    if (this.pilotStudyId) {
      this.pilotStudyService.getById(this.pilotStudyId)
        .then(res => {
          this.pilotStudyForm.setValue(res);
        }).catch(error => {
          // console.error('Não foi possível buscar estudo piloto!', error);
        })
    }
  }

  createForm() {
    if (this.pilotStudyId) {// Caso seja a tela de edição
      this.pilotStudyForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        start: ['', Validators.required],
        end: ['', Validators.required],
        health_professionals_id: [{ value: '', disabled: true }, Validators.required],
        is_active: [true, Validators.required]
      });
    }
    else {//Caso seja a tela de inserção
      this.pilotStudyForm = this.fb.group({
        id: [''],
        name: ['', Validators.required],
        start: ['', Validators.required],
        end: [{ value: '', disabled: true }, Validators.required],
        health_professionals_id: ['', Validators.required],
        is_active: [true, Validators.required]
      });
    }
    this.professionalsForm = this.fb.group({
      health_professionals_id_add: ['', Validators.required],
    });

    this.pilotStudyForm.get('start').valueChanges.subscribe(val => {
      this.pilotStudyForm.get('end').enable();
    });
  }

  onSubimt() {
    const form = this.pilotStudyForm.getRawValue();
    if (!this.pilotStudyId) {
      this.pilotStudyService.create(form)
        .then(pilotStudy => {
          this.pilotStudyForm.reset();
          this.toastService.info('Estudo Piloto criado!');
        })
        .catch(error => {
          this.toastService.error('Não foi possível criar estudo piloto!');
        });
    } else {
      this.pilotStudyService.update(form)
        .then(() => {
          this.toastService.info('Estudo Piloto atualizado!');
        })
        .catch(error => {
          this.toastService.error('Não foi possível atualizar estudo piloto!');
          // console.log('Não foi possível atualizar estudo!', error);
        });
    }
  }

  ngOnChanges() {//Caso o componente recba o id ele carrega o form com o estudo piloto correspondente.
    this.createForm();
    this.getPilotStudy();
  }

  onBack() {
    this.location.back();
  }

}
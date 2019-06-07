import {AfterViewChecked, Component, OnInit} from '@angular/core';
import {PilotStudyService} from "../../../modules/pilot-study/services/pilot-study.service";
import {PilotStudy} from "../../../modules/pilot-study/models/pilot.study";
import {PageEvent} from "@angular/material";
import {ActivatedRoute, Router} from "@angular/router";
import {LoadingService} from "../loading-component/service/loading.service";
import {SelectPilotStudyService} from "./service/select-pilot-study.service";
import {AuthService} from "../../../security/auth/services/auth.service";

@Component({
    selector: 'select-pilotstudy',
    templateUrl: './select-pilotstudy.component.html',
    styleUrls: ['./select-pilotstudy.component.scss']
})
export class SelectPilotstudyComponent implements OnInit, AfterViewChecked {

    userId: string;
    // MatPaginator Inputs
    pageSizeOptions: number[] = [10, 25, 100];

    // MatPaginator Output
    pageEvent: PageEvent;

    /* Controles de paginação */
    page = 1;
    limit = 10;
    length: number;

    list: Array<PilotStudy>;
    search: string;
    searchTime;

    listOfStudiesIsEmpty = false;

    userName: string = "";

    constructor(
        private pilotStudyService: PilotStudyService,
        private activeRouter: ActivatedRoute,
        private loadinService: LoadingService,
        private selecPilotService: SelectPilotStudyService,
        private selectPilot: SelectPilotStudyService,
        private authService: AuthService,
        private router: Router
    ) {
        this.list = new Array<PilotStudy>();
    }

    ngOnInit() {
        const pilotstudy_id = localStorage.getItem('pilotstudi_id');
        if (pilotstudy_id && pilotstudy_id !== '') {
            this.selecPilotService.close();
        }
        if (this.authService.decodeToken().sub_type === 'admin') {
            this.selecPilotService.close();
        }
        this.getAllPilotStudies();
        this.getLengthPilotStudies();
        this.getUserName();
    }

    loadUser(): void {
        const user_id = localStorage.getItem('user');

        if (user_id) {
            this.userId = atob(user_id);
        }
    }

    getAllPilotStudies() {
        if (!this.userId) {
            this.loadUser();
        }

        if (this.userId) {
            this.pilotStudyService.getAllByUserId(this.userId, this.page, this.limit)
                .then(studies => {
                    this.list = studies;
                    this.loadinService.close();
                    if (studies.length) {
                        this.listOfStudiesIsEmpty = false;
                    } else {
                        this.listOfStudiesIsEmpty = true;
                    }
                })
                .catch(errorResponse => {
                    this.listOfStudiesIsEmpty = true;
                    console.log('Erro ao buscar pilot-studies: ', errorResponse);
                });
        }
    }

    searchOnSubmit() {
        clearInterval(this.searchTime);
        this.searchTime = setTimeout(() => {
            this.pilotStudyService.getAllByUserId(this.userId, this.page, this.limit, this.search)
                .then(studies => {
                    this.list = studies;
                    this.getLengthPilotStudies();
                })
                .catch(errorResponse => {
                    console.log('Erro ao buscar pilot-studies: ', errorResponse);
                });
        }, 200);
    }

    getIndex(index: number): number {
        if (this.search) {
            return null;
        }
        const size = this.pageEvent && this.pageEvent.pageSize ? this.pageEvent.pageSize : this.limit;

        if (this.pageEvent && this.pageEvent.pageIndex) {
            return index + 1 + size * this.pageEvent.pageIndex;
        } else {
            return index + Math.pow(size, 1 - 1);
        }
    }

    clickPagination(event) {
        this.pageEvent = event;
        this.page = event.pageIndex + 1;
        this.limit = event.pageSize;
        this.getAllPilotStudies();
    }

    getLengthPilotStudies() {
        if (this.userId && this.userId !== '') {
            this.pilotStudyService.getAllByUserId(this.userId, undefined, undefined, this.search)
                .then(studies => {
                    this.length = studies.length;
                })
                .catch(errorResponse => {
                    console.log('Erro ao buscar pilot-studies: ', errorResponse);
                });
        }
    }

    selectPilotStudy(pilotstudy_id: string): void {
        if (!this.userId) {
            this.loadUser();
        }
        localStorage.setItem(this.userId, pilotstudy_id);
        this.selecPilotService.pilotStudyHasUpdated();
        this.selectPilot.close();

    }


    getUserName() {
        const username = atob(localStorage.getItem('username'));
        if (localStorage.getItem('username')) {
            this.userName = username;
        }
    }

    closeModal() {
        this.selecPilotService.close();
    }

    ngAfterViewChecked() {
        this.loadinService.close();
        const pilotstudy_id = localStorage.getItem('pilotstudy_id');
        // if (pilotstudy_id && pilotstudy_id !== '') {
        //     this.selecPilotService.close();
        // }
        // if (this.authService.decodeToken().sub_type === 'admin') {
        //     this.selecPilotService.close();
        // }
    }

}
import { AfterViewChecked, Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import { PilotStudyService } from '../../../modules/pilot.study/services/pilot.study.service';
import { PilotStudy } from '../../../modules/pilot.study/models/pilot.study';
import { LoadingService } from '../loading.component/service/loading.service';
import { SelectPilotStudyService } from './service/select.pilot.study.service';
import { AuthService } from '../../../security/auth/services/auth.service';
import { LocalStorageService } from '../../shared.services/local.storage.service';
import { ConfigurationBasic, PaginatorIntlService } from '../../../modules/config.matpaginator'
import { UserService } from '../../../modules/admin/services/users.service'

const PaginatorConfig = ConfigurationBasic;

@Component({
    selector: 'select-pilotstudy',
    templateUrl: './select.pilotstudy.component.html',
    styleUrls: ['./select.pilotstudy.component.scss']
})
export class SelectPilotstudyComponent implements OnInit, AfterViewChecked {
    /* Paging Settings */
    pageSizeOptions: number[];
    pageEvent: PageEvent;
    page: number;
    limit: number;
    length: number;
    list: Array<PilotStudy>;
    search: string;
    searchTime;
    listOfStudiesIsEmpty: boolean;
    userId: string;
    userName = '';

    constructor(
        private pilotStudyService: PilotStudyService,
        private paginatorService: PaginatorIntlService,
        private activeRouter: ActivatedRoute,
        private loadinService: LoadingService,
        private selecPilotService: SelectPilotStudyService,
        private selectPilot: SelectPilotStudyService,
        private authService: AuthService,
        private userService: UserService,
        private localStorageService: LocalStorageService
    ) {
        this.page = PaginatorConfig.page;
        this.pageSizeOptions = PaginatorConfig.pageSizeOptions;
        this.limit = PaginatorConfig.limit;
        this.listOfStudiesIsEmpty = false;
        this.list = new Array<PilotStudy>();
    }

    ngOnInit() {
        if (this.authService.decodeToken().sub_type === 'admin') {
            this.selecPilotService.close();
        }
        this.getUser();
        this.getAllPilotStudies();
    }

    loadUser(): void {
        const user_id = this.localStorageService.getItem('user');
        if (user_id) {
            this.userId = user_id;
        }
    }

    getAllPilotStudies() {
        if (!this.userId) {
            this.loadUser();
        }

        if (this.userId) {
            this.list = [];
            this.pilotStudyService.getAllByUserId(this.userId, this.page, this.limit)
                .then(httpResponse => {
                    if (httpResponse.body && httpResponse.body.length) {
                        this.list = httpResponse.body;
                    }
                    this.length = parseInt(httpResponse.headers.get('x-total-count'), 10);
                    this.loadinService.close();
                    this.listOfStudiesIsEmpty = !(this.list && this.list.length);
                })
                .catch(() => {
                    this.listOfStudiesIsEmpty = true;
                });
        }
    }

    searchOnSubmit() {
        clearInterval(this.searchTime);
        this.searchTime = setTimeout(() => {
            this.list = [];
            this.pilotStudyService.getAllByUserId(this.userId, this.page, this.limit, this.search)
                .then(httpResponse => {
                    this.length = parseInt(httpResponse.headers.get('x-total-count'), 10);
                    if (httpResponse.body && httpResponse.body.length) {
                        this.list = httpResponse.body;
                    }
                })
                .catch();
        }, 500);
    }

    getIndex(index: number): number {
        if (this.search) {
            return null;
        }
        return this.paginatorService.getIndex(this.pageEvent, this.limit, index);
    }

    clickPagination(event) {
        this.pageEvent = event;
        this.page = event.pageIndex + 1;
        this.limit = event.pageSize;
        this.getAllPilotStudies();
    }

    selectPilotStudy(pilotstudy_id: string): void {
        if (!this.userId) {
            this.loadUser();
        }
        this.localStorageService.setItem(this.userId, pilotstudy_id);
        this.selecPilotService.pilotStudyHasUpdated(pilotstudy_id);
        this.closeModal();
    }


    getUser() {
        this.userId = this.localStorageService.getItem('user');
        const localUserLogged = JSON.parse(this.localStorageService.getItem('userLogged'));
        try {
            const username = localUserLogged.name ? localUserLogged.name : localUserLogged.email;
            this.userName = username;
            if (localUserLogged.selected_pilot_study) {
                this.selectPilotStudy(localUserLogged.selected_pilot_study);
            }

        } catch (e) {
            this.userService.getUserById(this.localStorageService.getItem('user'))
                .then(user => {
                    if (user) {
                        this.userId = user.id;
                        this.userName = user.name ? user.name : user.email;
                        const health_area = user.health_area ? user.health_area : 'admin';
                        this.localStorageService.setItem('userLogged', JSON.stringify(user));
                        this.localStorageService.setItem('email', user.email);
                        this.localStorageService.setItem('health_area', health_area);
                        if (user.selected_pilot_study) {
                            this.selectPilotStudy(user.selected_pilot_study);
                        }
                    }
                })
                .catch(() => {
                });
        }

    }

    closeModal() {
        this.selecPilotService.close();
    }

    trackById(index, item) {
        return item.id;
    }

    ngAfterViewChecked() {
        this.loadinService.close();
    }

}

import { EventEmitter, Injectable } from '@angular/core';

import { UserService } from '../../../../modules/admin/services/users.service'
import { LocalStorageService } from '../../../shared.services/local.storage.service'

declare var $: any;

@Injectable()
export class SelectPilotStudyService {

    pilotStudyUpdated = new EventEmitter();

    constructor(
        private userService: UserService,
        private localStorageService: LocalStorageService) {

    }

    open() {
        $('#selectPilotStudy').modal('show');
    }

    close() {
        $('#selectPilotStudy').modal('hide');
    }

    pilotStudyHasUpdated(pilotId: string) {
        const userId = this.localStorageService.getItem('user');
        this.userService.changePilotStudySelected(userId, pilotId)
            .then(() => this.pilotStudyUpdated.emit())
            .catch(() => {
            })
    }

}

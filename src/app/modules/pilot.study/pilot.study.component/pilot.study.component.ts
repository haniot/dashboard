import { AfterViewChecked, Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingService } from '../../../shared/shared.components/loading.component/service/loading.service'

@Component({
    selector: 'app-pilot-study-component',
    templateUrl: './pilot.study.component.html',
    styleUrls: ['./pilot.study.component.scss']
})
export class PilotStudyComponent implements AfterViewChecked {
    constructor(
        private router: Router,
        private loadingService: LoadingService
    ) {
    }

    newPilotStudy() {
        this.router.navigate(['/app/pilotstudies', 'new']);
    }

    ngAfterViewChecked() {
        this.loadingService.close();
    }
}

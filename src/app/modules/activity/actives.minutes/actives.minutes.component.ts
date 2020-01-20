import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TranslateService } from '@ngx-translate/core';
import { TimeSeries, TimeSeriesItem, TimeSeriesType } from '../models/time.series';
import { SearchForPeriod } from '../../measurement/models/measurement'

@Component({
    selector: 'actives-minutes',
    templateUrl: './actives.minutes.component.html',
    styleUrls: ['../../measurement/shared.style/shared.styles.scss']
})
export class ActivesMinutesComponent implements OnInit, OnChanges {
    @Input() data: TimeSeries;
    @Input() filterVisibility: boolean;
    @Input() patientId: string;
    @Input() includeCard: boolean;
    @Input() showSpinner: boolean;
    @Output() filterChange: EventEmitter<any>;
    options: any;
    echartsInstance: any;
    listIsEmpty: boolean;

    constructor(
        private datePipe: DatePipe,
        private translateService: TranslateService
    ) {
        this.data = new TimeSeries();
        this.filterVisibility = false;
        this.patientId = '';
        this.showSpinner = false;
        this.filterChange = new EventEmitter();
        this.listIsEmpty = false;
    }

    ngOnInit(): void {
        this.loadGraph();
    }

    onChartInit(event) {
        this.echartsInstance = event;
    }

    applyFilter(filter: SearchForPeriod) {

    }


    loadGraph() {

        const xAxisOptions = {
            data: [],
            silent: false,
            splitLine: {
                show: false
            }
        };
        const seriesOptions = {
            type: 'bar',
            color: '#AFE42C',
            data: [],
            barMaxWidth: '30%',
            animationDelay: function (idx) {
                return idx * 10;
            }
        };

        if (this.data) {
            this.data.data_set.forEach((element: TimeSeriesItem) => {
                xAxisOptions.data.push(this.datePipe.transform(element.date, 'shortDate'));
                seriesOptions.data.push({
                    value: element.value,
                    time: this.datePipe.transform(element.date, 'mediumTime')
                });
            });
        }


        this.options = {
            legend: {
                data: ['bar', 'bar2'],
                align: 'left'
            },
            tooltip: {},
            xAxis: xAxisOptions,
            yAxis: {},
            series: seriesOptions,
            animationEasing: 'elasticOut',
            animationDelayUpdate: function (idx) {
                return idx * 5;
            }
        };

    }

    updateGraph(measurements: Array<TimeSeries>): void {

        this.options.xAxis.data = [];
        this.options.series.data = [];

        measurements.forEach((activeMinutes: TimeSeries) => {
            if (activeMinutes.data_set) {
                activeMinutes.data_set.forEach((element: TimeSeriesItem) => {
                    this.options.xAxis.data.push(this.datePipe.transform(element.date, 'shortDate'));
                    this.options.series.data.push({
                        value: element.value,
                        time: this.datePipe.transform(element.date, 'mediumTime')
                    });
                });
            }

        });

        this.echartsInstance.setOption(this.options);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.data.currentValue !== changes.data.previousValue) {
            this.loadGraph();
        }
    }

}

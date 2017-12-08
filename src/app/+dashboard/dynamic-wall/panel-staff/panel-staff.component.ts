import { Component, OnInit } from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Http} from "@angular/http";

@Component({
  selector: 'app-panel-staff',
  templateUrl: './panel-staff.component.html',
  styleUrls: ['./panel-staff.component.css']
})
export class PanelStaffComponent implements OnInit {
    //方法1的 start
    dataSource: Observable<any>;
    products: Array<any> = [];
    ////方法1的 end
    chartOption;
    seriesInfo: Array<any> = [];

  constructor(private http:Http) {
  }


    ngOnInit() {
            this.getSeriesInfo();

    }
    getSeriesInfo(){

        this.chartOption = {
            color: ['#1ab394','#c79121'],
          tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b}: {c} ({d}%)"
        },
            legend: {
                orient: 'vertical',
                x: 'left',
                data:['健康','不健康']
            },
            series: [
                {
                    name:'直接访问',
                    type:'pie',
                    radius: ['50%', '70%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center'
                        },
                        emphasis: {
                            show: true,
                            textStyle: {
                                fontSize: '30',
                                fontWeight: 'bold'
                            }
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    },
                    data:[
                        {value:80, name:'健康'},
                        {value:40, name:'不健康'}
                    ]
                }
            ]
        }
    }

}
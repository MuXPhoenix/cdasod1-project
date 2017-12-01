import {Component, OnInit, ViewChild} from '@angular/core';
import {FadeInTop} from '../../shared/animations/fade-in-top.decorator';
import {Observable} from "rxjs/Observable";
import {Http} from "@angular/http";
import "rxjs/Rx";
import {GlobalService} from "../../core/global.service";
import {CookieStoreService} from "../../shared/cookies/cookie-store.service";  // 用于map方法是用
@FadeInTop()
@Component({
    selector: 'app-data-map',
    templateUrl: './data-map.component.html',
    styleUrls: ['./data-map.component.css']
})
export class DataMapComponent implements OnInit {
    dataSource: Observable<any>;
    products: Array<any> = [];

    dataSource1: Observable<any>;
    products1: Array<any> = [];

    customerDefault : Array<any> = [];
    company:string = 'all';

    private interval;
    //画图
    //方法1的 start
    dataSource_ : Observable<any>;
    products_ : Array<any> = [];
    ////方法1的 end
    chartOption_;
    seriesInfo_ : Array<any> = [];
    //日平均报表
    dataSource_day : Observable<any>;
    products_day : Array<any> = [];
    chartOption_day;
    seriesInfo_day : Array<any> = [];

    size : number = 5;
    private isClear;
    showMetric:string = '';
    is_show_1 : string = 'none';
    is_show_2 : string = 'block';

    //颜色设置列表信息
    colorShow  : Array<any> = [];
    count : number = 0;
    constructor(
        private http : Http,
        private router:Router,
        private globalService : GlobalService,
        private cookiestore : CookieStoreService
    ) {
        this.getDefault();
        window.scrollTo(0,0);
    }

    ngOnInit() {
        this.getColorShow();
        this.interval = setInterval(() => {
            this.search_datapoint();//请求http数据
        }, 3*60*1000);

    }

    /**
     * 阶段颜色显示
     */
    getColorShow(){
        let url = this.globalService.getDomain()+'/api/v1/getSettingsInfo?sid='+this.cookiestore.getCookie('sid');
        this.http.get(url)
            .map((res)=>res.json())
            .subscribe((data)=>{
                this.colorShow = data;
            });
        setTimeout(() => {
            console.log('this.colorShow:--');
            console.log(this.colorShow);
            if(this.colorShow['status'] == 202){
                this.cookiestore.removeAll();
                this.router.navigate(['/auth/login']);
            }
        }, 500);
    }

    /**
     * 获取颜色
     * @param pro
     */
    getColor(pro:Array<any>,entry:string){
        let array_retu : Array<any> = [];
        let color_ = {
            'color':'',
            // 'up_color':'#ebcccc'
        };
        if(this.colorShow['result'].length > 0) {
            //将颜色便利进（最新数据）显示数组
            for (var i = 0; i < this.colorShow['result'].length; i++) {
                if (this.colorShow['result'][i]['s_name'] == entry) {
                    for (var s = 0; s < this.colorShow['result'][i]['detail'].length; s++) {
                        let min = parseInt(this.colorShow['result'][i]['detail'][s]['s_interval_1']);
                        let max = parseInt(this.colorShow['result'][i]['detail'][s]['s_interval_2']);
                        for (var v = 0;v<pro[entry]['value'].length;v++){
                            let val = parseInt(pro[entry]['value'][v]);
                            if (val >= min && val <= max) {
                                color_.color = this.colorShow['result'][i]['detail'][s]['s_color'];
                                // color_.up_color = this.colorShow['result'][i]['detail'][s]['s_up_color'] == '' ? color_.up_color : this.colorShow['result'][i]['detail'][s]['s_up_color'];
                            }else{
                                color_.color = '';
                                // color_.up_color = '#ebcccc';
                            }
                            array_retu.push(color_);
                        }
                    }
                }
            }
        }
        return array_retu;
    }


    getDefault(){
        this.http.get(this.globalService.getDomain()+'/api/v1/getCustomerInfo?c_role=1&sid='+this.cookiestore.getCookie('sid'))
            .map((res)=>res.json())
            .subscribe((data)=>{
                this.customerDefault = data;
            });
        setTimeout(() => {
            console.log('this.customerDefault:-----');
            console.log(this.customerDefault);

            if(this.customerDefault['status'] == 202){
                this.cookiestore.removeAll();
                this.router.navigate(['/auth/login']);
            }
            this.company = this.customerDefault['result']['c_number'];

            if(this.customerDefault.length == 0){
                alert('页面初始化错误，请刷新页面重试！');
                return ;
            }
            this.search_datapoint();
        },500);
    }
    search_datapoint(){
        if(this.count >= 5){
            return false;
        }
        let that = this;

        let color_={
            'color':'',
            // 'up_color':'#ebcccc'
        };
        that.size = 5;
        that.dataSource = that.http.get(that.globalService.getTsdbDomain()+'/tsdb/api/getDatapoint.php?size='+that.size+'&cid='+that.company+'&index=1')
            .map((res)=>res.json());
        that.dataSource.subscribe(
            (data)=>that.products=data
        );
        setTimeout(() => {
            console.log('this.products:-----');
            console.log(this.products);
            if (this.products.length == 0) {
                this.count++;
                this.search_datapoint();
                return false;
            }

            for (let dataInfo of this.products['data']) {
                let c: number = 0;
                for (let entry of dataInfo['name']) {
                    let vNum :number = 0;
                    let colorA : Array<any> = [];
                    // let upColorA : Array<any> = [];
                    for(let value of dataInfo['info'][entry]['value']) {
                        if(this.colorShow['result'] && this.colorShow['result'][entry]) {
                            for (var s = 0; s < this.colorShow['result'][entry].length; s++) {
                                let min = parseInt(this.colorShow['result'][entry][s]['s_interval_1']);
                                let max = parseInt(this.colorShow['result'][entry][s]['s_interval_2']);
                                let val = parseInt(value);
                                if (val >= min && val <= max) {
                                    colorA.push(this.colorShow['result'][entry][s]['s_color']);
                                    // upColorA.push(this.colorShow['result'][entry][s]['s_up_color'] == '' ? color_.up_color : this.colorShow['result'][entry][s]['s_up_color']);
                                }
                            }
                        } else {
                            colorA.push(color_.color);
                            // upColorA.push(color_.up_color) ;
                        }
                        this.products['data'][0]['info'][entry]['color'] = colorA;
                        // this.products['data'][0]['info'][entry]['up_color'] = upColorA ;
                        vNum++;
                    }
                    c++;
                }
            }
        }, 5*1000);


        setTimeout(() => {
            that.size = 5;
            that.dataSource1 = that.http.get(that.globalService.getTsdbDomain()+'/tsdb/api/getDatapoint.php?size='+that.size+'&cid='+that.company+'&index=2')
                .map((res)=>res.json());
            that.dataSource1.subscribe(
                (data)=>that.products1=data
            );

            setTimeout(() => {
                console.log('this.products1:-----');
                console.log(this.products1);
                if (this.products1.length == 0) {
                    this.count++;
                    this.search_datapoint();
                    return false;
                }

                for (let dataInfo of this.products1['data']) {
                    let c: number = 0;
                    for (let entry of dataInfo['name']) {
                        let vNum :number = 0;
                        let colorA : Array<any> = [];
                        // let upColorA : Array<any> = [];
                        for(let value of dataInfo['info'][entry]['value']) {
                            if(this.colorShow['result'] && this.colorShow['result'][entry]) {
                                for (var s = 0; s < this.colorShow['result'][entry].length; s++) {
                                    let min = parseInt(this.colorShow['result'][entry][s]['s_interval_1']);
                                    let max = parseInt(this.colorShow['result'][entry][s]['s_interval_2']);
                                    let val = parseInt(value);
                                    if (val >= min && val <= max) {
                                        colorA.push(this.colorShow['result'][entry][s]['s_color']);
                                        // upColorA.push(this.colorShow['result'][entry][s]['s_up_color'] == '' ? color_.up_color : this.colorShow['result'][entry][s]['s_up_color']);
                                    }
                                }
                            } else {
                                colorA.push(color_.color);
                                // upColorA.push(color_.up_color) ;
                            }
                            this.products1['data'][0]['info'][entry]['color'] = colorA;
                            // this.products1['data'][0]['info'][entry]['up_color'] = upColorA ;
                            vNum++;
                        }
                        c++;
                    }
                }
            }, 5*1000);
        },1000);

    }


    /**
     * 离开页面的时候移除定时器
     * @returns {boolean}
     */
    ngOnDestroy() {
        this.interval &&  clearInterval(this.interval);
    }

    /**
     * 展示弹框
     */
    showPic(value:string){
        this.showMetric = value;
        console.log(value);
        this.search_datapoint_pic(value);//请求http数据
        this.isClear = setInterval(() => {
            this.search_datapoint_pic(value);//请求http数据
        }, 3*60*1000);
    }

    search_datapoint_pic(value:string){
        this.size = 50;
        this.dataSource_ = this.http.get(this.globalService.getTsdbDomain()+'/tsdb/api/getDatapoint.php?size='+this.size+'&metric='+value+'&cid='+this.company)
            .map((res)=>res.json());
        this.dataSource_.subscribe((data)=>this.products_=data);

        setTimeout(() => {
            this.getSeriesInfo_pic(value);
        }, 3000);
    }

    getSeriesInfo_pic(value:string) {
        this.seriesInfo_ = [];
        console.log('this.products_');
        console.log(this.products_);
        if(this.products_.length == 0) {
            this.search_datapoint_pic(value);
            return false;
        }
        for (let entry of this.products_['data'][0]['name']) {
            this.seriesInfo_.push({
                name: entry,
                type: 'line', stack: '总量',
                data: this.products_['data'][0]['info'][entry]['value']
            });
        }

        this.chartOption_ = {
            title: {
                text: '设备检测数据'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: this.products_['data'][0]['name']
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    magicType: {type: ['line', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: this.products_['data'][0]['time']
            }],
            yAxis: [{
                type: 'value'
            }],
            series: this.seriesInfo_
        };
    }


    /**
     * 日平均报表
     */
    showDayData(m_type:string,m_category:number){
        if(m_type != 'day'){
            this.is_show_1 = "none";
            this.is_show_2 = "block";
        }else{
            this.is_show_1 = "block";
            this.is_show_2 = "none";
            console.log(this.products_day);
            if( this.products_day.length == 0 || this.products_day == [] ) {
                this.seriesInfo_ = [];
                this.products_ = [];
                this.isClear &&  clearInterval(this.isClear);
                this.search_datapoint_day(m_type,m_category);//请求http数据
            }
        }
    }

    search_datapoint_day(m_type:string,m_category:number){
        this.dataSource_day = this.http.get(this.globalService.getDomain()+'/api/v1/getMeanList?m_type='+m_type+'&m_category='+m_category+'&c_id='+this.company+'&m_sensor='+this.showMetric)
            .map((res)=>res.json());
        this.dataSource_day.subscribe((data)=>this.products_day=data);

        setTimeout(() => {
            this.getSeriesInfo_day(m_type,m_category);
        }, 2000);
    }

    getSeriesInfo_day(m_type:string,m_category:number) {
        this.seriesInfo_day = [];
        if(this.products_day.length == 0) {
            this.search_datapoint_day(m_type,m_category);
            return false;
        }
        for (let entry of this.products_day['result']['name']) {
            this.seriesInfo_day.push({
                name: entry,
                type: 'line', stack: '总量',
                data: this.products_day['result']['value']
            });
        }

        this.chartOption_day = {
            title: {
                text: '设备检测数据'
            },
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: this.products_day['result']['name']
            },
            toolbox: {
                show: true,
                feature: {
                    dataView: {readOnly: false},
                    magicType: {type: ['line', 'bar']},
                    restore: {},
                    saveAsImage: {}
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: this.products_day['result']['time']
            }],
            yAxis: [{
                type: 'value'
            }],
            series: this.seriesInfo_day
        };

        console.log('chartOption_day');
        console.log(this.chartOption_day);
    }

    /**
     * 关闭弹出层关闭定时器
     * @returns {boolean}
     */
    ngOnClose() {
        this.seriesInfo_ = [];
        this.products_ = [];
        this.chartOption_day = [];
        this.products_day = [];
        this.showMetric = '';
        this.is_show_1 = "none";
        this.is_show_2 = "block";
        this.isClear &&  clearInterval(this.isClear);
    }

}

import { Pipe, PipeTransform } from '@angular/core';
import {Router} from "@angular/router";
import {any} from "codelyzer/util/function";

@Pipe({name: 'keys'})
export class KeysPipe implements PipeTransform
{
    transform(value:any, args:string[]): any {
        let keys:any[] = [];
        for (let key in value) {
            keys.push({key: key, value: value[key]});
        }
        return keys;
    }
}
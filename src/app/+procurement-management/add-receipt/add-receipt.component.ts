import { Component, OnInit } from '@angular/core';
import {Http} from "@angular/http";
import {ActivatedRoute, Router} from "@angular/router";
import {CookieStoreService} from "../../shared/cookies/cookie-store.service";
import {GlobalService} from "../../core/global.service";
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-add-receipt',
  templateUrl: './add-receipt.component.html',
})
export class AddReceiptComponent implements OnInit {

  formModel : FormGroup;
  pr_id : number = 0;
  purchaseList : Array<any> = [];
  userList : Array<any> = [];
  purchaseInfo : Array<any> = [];

  //默认选中值
  pr_supplier_default : number = 0; //供应商
  pr_department_default : number = 0; //采购部门
  pr_employee_default : number = 0; //采购员
  storehouse_id_default : number = 0; //仓库
  pr_category_default: number = 0; //采购类型
  pr_transport_default: number = 0; //运输方式

  rollback_url : string = '/procurement-management/add-receipt';
  constructor(
      fb:FormBuilder,
      private http:Http,
      private router : Router,
      private routInfo : ActivatedRoute,
      private cookieStore:CookieStoreService,
      private globalService:GlobalService) {

    this.formModel = fb.group({
      pr_id:[''],
      pr_order:[''],
      pr_date:[''],
      pr_type:[''],
      pr_supplier:[''],
      pr_department:[''],
      pr_employee:[''],
      storehouse_id:[''],
      pr_category:[''],
      pr_transport:[''],
      pr_qrcode:[''],
      pr_detail:[''],
      pr_note:['']
    });
  }

  ngOnInit() {
    this.pr_id = this.routInfo.snapshot.params['pr_id'];
    if(this.pr_id != 0){
      this.getPurchaseInfo(this.pr_id);
      this.rollback_url += '/' + this.pr_id;
    }else{
      this.rollback_url += '/0';
    }
    this.getPurchaseDefault();
  }

  getPurchaseInfo(pr_id:number){
    this.http.get(this.globalService.getDomain()+'/api/v1/getPurchaseInfo?pr_id='+pr_id)
        .map((res)=>res.json())
        .subscribe((data)=>{
          this.purchaseInfo = data;
        });
    setTimeout(() => {
      console.log(this.purchaseInfo);
      this.formModel.patchValue({
        pr_id:this.purchaseInfo['result']['pr_id'],
        pr_order:this.purchaseInfo['result']['pr_order'],
        pr_date:this.purchaseInfo['result']['pr_date'],
        pr_type:this.purchaseInfo['result']['pr_type'],
        pr_supplier:this.purchaseInfo['result']['pr_supplier'],
        pr_department:this.purchaseInfo['result']['pr_department'],
        pr_employee:this.purchaseInfo['result']['pr_employee'],
        storehouse_id:this.purchaseInfo['result']['storehouse_id'],
        pr_category:this.purchaseInfo['result']['pr_category'],
        pr_transport:this.purchaseInfo['result']['pr_transport'],
        pr_qrcode:this.purchaseInfo['result']['pr_qrcode'],
        pr_detail:this.purchaseInfo['result']['pr_detail'],
        pr_note:this.purchaseInfo['result']['pr_note']
      });

      this.pr_supplier_default = this.purchaseInfo['result']['pr_supplier']; //供应商
      this.pr_department_default = this.purchaseInfo['result']['pr_department']; //采购部门
      this.pr_employee_default = this.purchaseInfo['result']['pr_employee']; //采购员
      this.storehouse_id_default =this.purchaseInfo['result']['storehouse_id']; //仓库
      this.pr_category_default =this.purchaseInfo['result']['pr_category']; //采购类型
      this.pr_transport_default = this.purchaseInfo['result']['pr_transport']; //运输方式

      if(this.purchaseInfo['result']['pr_department'] != 0){
        this.getUserList(this.purchaseInfo['result']['pr_department'],2);
      }
    }, 500);
  }

  /**
   * 获取采购员信息
   */
  getUserList(obj,num:number){
    let id = 0;
    if(num == 1){
      id = obj.target.value;
    }else{
      id = obj;
    }
    let url = this.globalService.getDomain()+'/api/v1/getPurchaseUser';
    console.log(id);
    if(id != 0){
      url += '?category_id='+id;
    }
    this.http.get(url)
        .map((res)=>res.json())
        .subscribe((data)=>{
          this.userList = data;
        });
    setTimeout(() => {
      if(this.userList['status'] == 201){
        alert(this.userList['msg']);
      }
    }, 600);
  }


  /**
   * 获取默认参数
   */
  getPurchaseDefault() {
    this.http.get(this.globalService.getDomain()+'/api/v1/getPurchaseDefault?sid='+this.cookieStore.getCookie('sid'))
        .map((res)=>res.json())
        .subscribe((data)=>{
          this.purchaseList = data;
        });

    setTimeout(() => {
      console.log('this.purchaseList:----');
      console.log(this.purchaseList);
      if(this.purchaseList['status'] == 202){
        alert(this.purchaseList['msg']);
        this.cookieStore.removeAll(this.rollback_url);
        this.router.navigate(['/auth/login']);
      }
    }, 600);
  }

  onSubmit(){
    if(this.formModel.value['pr_date'].trim() == ''){
      alert('请填写单据日期！');
      return false;
    }
    if(this.formModel.value['pr_order'].trim() == ''){
      alert('请填写单据号！');
      return false;
    }
    // console.log(this.formModel.value['name']);
    this.http.post(this.globalService.getDomain()+'/api/v1/addPurchase',{
      'pr_id':this.formModel.value['pr_id'],
      'pr_order':this.formModel.value['pr_order'],
      'pr_date':this.formModel.value['pr_date'],
      'pr_type':this.formModel.value['pr_type'],
      'pr_supplier':this.formModel.value['pr_supplier'],
      'pr_department':this.formModel.value['pr_department'],
      'pr_employee':this.formModel.value['pr_employee'],
      'storehouse_id':this.formModel.value['storehouse_id'],
      'pr_category':this.formModel.value['pr_category'],
      'pr_transport':this.formModel.value['pr_transport'],
      'pr_qrcode':this.formModel.value['pr_qrcode'],
      'pr_detail':this.formModel.value['pr_detail'],
      'pr_note':this.formModel.value['pr_note'],
      'u_id':this.cookieStore.getCookie('uid'),
      'sid':this.cookieStore.getCookie('sid')
    }).subscribe(
        (data)=>{
          let info = JSON.parse(data['_body']);
          alert(info['msg']);
          if(info['status'] == 200) {
            this.router.navigate(['/procurement-management/procurement-receipt']);
          }else if(info['status'] == 202){
            this.cookieStore.removeAll(this.rollback_url);
            this.router.navigate(['/auth/login']);
          }
        }
    );
  }

}

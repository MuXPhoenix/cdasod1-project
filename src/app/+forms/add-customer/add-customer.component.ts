import { Component, OnInit } from '@angular/core';
import {FadeInTop} from '../../shared/animations/fade-in-top.decorator';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import {mobileAsyncValidator, mobileValidator,passwordValidator} from '../../shared/common/validator';//passwordValidator

import {Http} from '@angular/http';
import {Router,ActivatedRoute} from '@angular/router';
import {CookieStoreService} from '../../shared/cookies/cookie-store.service';

@FadeInTop()
@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
})
export class AddCustomerComponent implements OnInit {

  formModel : FormGroup;
  userList : Array<any> = [];

  c_id : number = 0;
  customer_info : Array<any> = [];
  constructor(
      fb:FormBuilder,
      private http:Http,
      private router : Router,
      private routInfo : ActivatedRoute,
      private cookieStore:CookieStoreService
  ) {
    this.formModel = fb.group({
      c_id:[''],
      number:['',[Validators.required,Validators.minLength(1)]],
      name:['',[Validators.required,Validators.minLength(1)]],
      abbreviation:[''],
      industry_category:[''],
      email:[''],
      // passwords : fb.group({
      //   password:['',[Validators.minLength(6)]],
      //   pconfirm:['']
      // },{validator:passwordValidator}),
      phone:['',mobileValidator,mobileAsyncValidator],
      department:[''],
      address:[''],
      contacts:[''],
      products:[''],
      source:[''],
      service_person:[''],
      config:[''],
      notes:[''],
    });
  }


  ngOnInit() {
    this.c_id = this.routInfo.snapshot.params['c_id'];
    console.log( 'this.c_id:----');
    console.log( this.c_id);
    if(this.c_id != 0){
      this.getCustomerInfo(this.c_id);
    }
    this.getCustomerDefault();
  }

  getCustomerInfo(c_id:number){
    this.http.get('http://182.61.53.58:8080/api/v1/getCustomerInfo?c_id='+c_id+'&c_role=1')
        .map((res)=>res.json())
        .subscribe((data)=>{
          this.customer_info = data;
        });
    setTimeout(() => {
      console.log(this.customer_info);
      this.formModel.patchValue({
        c_id:this.customer_info['result']['c_id'],
        number:this.customer_info['result']['c_number'],
        name:this.customer_info['result']['c_name'],
        phone:this.customer_info['result']['c_phone'],
        email:this.customer_info['result']['c_email'],
        abbreviation:this.customer_info['result']['c_abbreviation'],
        industry_category:this.customer_info['result']['c_industry_category'],
        department:this.customer_info['result']['c_department'],
        address:this.customer_info['result']['c_address'],
        contacts:this.customer_info['result']['c_contacts'],
        products:this.customer_info['result']['c_products'],
        source:this.customer_info['result']['c_source'],
        service_person:this.customer_info['result']['c_service_person'],
        config:this.customer_info['result']['c_config'],
        notes:this.customer_info['result']['c_notes'],
        role:this.customer_info['result']['c_role'],
        parent_id:this.customer_info['result']['c_parent_id']
      });
    }, 500);
  }

  /**
   * 获取添加客户的默认参数
   */
  getCustomerDefault() {
      this.http.get('http://182.61.53.58:8080/api/v1/getCustomerDefault?sid='+this.cookieStore.getCookie('sid'))
        .map((res)=>res.json())
        .subscribe((data)=>{
          this.userList = data;
      });

    setTimeout(() => {
      console.log('this.userList:----');
      console.log(this.userList);

      if(this.userList['status'] == 202){
        alert(this.userList['msg']);
        this.cookieStore.removeAll();
        this.router.navigate(['/auth/login']);
      }
    }, 300);
  }

  onSubmit(){
    if(this.formModel.value['number'] == ''){
      alert('请填写客户编号！');
      return false;
    }
    if(this.formModel.value['name'] == ''){
      alert('请填写客户名称！');
      return false;
    }
    // console.log(this.formModel.value['name']);
    this.http.post('http://182.61.53.58:8080/api/v1/addCustomer',{
      'c_id':this.formModel.value['c_id'],
      'number':this.formModel.value['number'],
      'name':this.formModel.value['name'],
      'phone':this.formModel.value['phone'],
      // 'password':this.formModel.value['passwords']['password'],
      'email':this.formModel.value['email'],
      'abbreviation':this.formModel.value['abbreviation'],
      'industry_category':this.formModel.value['industry_category'],
      'department':this.formModel.value['department'],
      'address':this.formModel.value['address'],
      'contacts':this.formModel.value['contacts'],
      'products':this.formModel.value['products'],
      'source':this.formModel.value['source'],
      'service_person':this.formModel.value['service_person'],
      'config':this.formModel.value['config'],
      'notes':this.formModel.value['notes'],
      'role':1,
      'parent_id':0,
      'sid':this.cookieStore.getCookie('sid')
    }).subscribe(
        (data)=>{
          let info = JSON.parse(data['_body']);
          alert(info['msg']);
          if(info['status'] == 200) {
            this.router.navigateByUrl('/tables/client');
          }else if(info['status'] == 202){
            this.cookieStore.removeAll();
            this.router.navigate(['/auth/login']);
          }
        },
        response => {
          console.log('PATCH call in error', response);
        },
        () => {
          console.log('The PATCH observable is now completed.');
        }
    );
  }

}

import { Component, OnInit } from '@angular/core';
import {FadeInTop} from '../../shared/animations/fade-in-top.decorator';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {mobileAsyncValidator, mobileValidator} from '../../shared/common/validator';//passwordValidator

import {Http} from '@angular/http';
import {Router} from '@angular/router';

@FadeInTop()
@Component({
  selector: 'app-add-customer1',
  templateUrl: './add-customer1.component.html',
})
export class AddCustomer1Component implements OnInit {

  formModel : FormGroup;
  customerList : Array<any> = [];
  constructor(
      fb:FormBuilder,
      private http:Http,
      private router : Router
  ) {
    this.formModel = fb.group({
      number:['',[Validators.required,Validators.minLength(1)]],
      name:['',[Validators.required,Validators.minLength(1)]],
      abbreviation:[''],
      industry_category:[''],
      email:[''],
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
    this.getCustomerDefault();
  }

  /**
   * 获取添加客户的默认参数
   */
  getCustomerDefault() {
    this.http.get('/api/v1/getCustomerDefault')
        .map((res)=>res.json())
        .subscribe((data)=>{
          this.customerList = data;
        });

    setTimeout(() => {
      console.log('this.customerList:----');
      console.log(this.customerList);
    }, 300);
  }

  onSubmit(){
    // console.log(this.formModel.value['name']);
    this.http.post('/api/v1/addCustomer',{
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
      'role':2
    }).subscribe(
        (data)=>{
          alert(JSON.parse(data['_body'])['msg']);
          if(data['status'] == 200) {
            this.router.navigateByUrl('/tables/client1');
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

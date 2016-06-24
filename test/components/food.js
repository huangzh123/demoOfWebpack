/**
 * Created by Administrator on 2016/6/24.
 */
"use strict";

function Food(name,num){
    this.name=name;
    this.num=num;
}

Food.prototype.getFood=function(){
    return this.name;
}

module.exports=Food;
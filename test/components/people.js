/**
 * Created by Administrator on 2016/6/24.
 */
"use strict";

var Food=require("./food.js");

var food=new Food("apple444",5);
function People(name){
    this.name=name;
}

People.prototype.eat=function(){
    return this.name+" eating "+food.num+" "+food.name;
}

module.exports=People;
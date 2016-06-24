"use strict";
var People=require("./people.js");

require("./main.css");
require("./index.scss");
var people=new People("Mr.ming");


var div=document.createTextNode(people.eat())
document.body.appendChild(div);
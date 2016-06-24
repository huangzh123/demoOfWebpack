/**
 * Created by Administrator on 2016/6/12.
 */
"use strict";

/**
 * 预加载图片函数
 * @param images 图片数组或者对对象
 * @param callback 加载完成的回调函数
 * @param timeout 加载超时的时长
 */
function loadImage(images,callback,timeout){
    //加载完成图片的计数器
    var count=0;
    //全部图片加载成功的一个标志位
    var success=true;
    //超时timer的id
    var timeoutId=0;
    //是否加载超时的标志位
    var isTimeout=false;
    //对图片数组（或对象）进行遍历
    for(var key in images){
        //过滤prototype上的属性
        if(!images.hasOwnProperty(key)){
            continue;
        }
        //获取每个图片元素
        //期望格式是个object：｛src:xxx｝
        var item=images[key];

        if(typeof item === "string"){
            item=images[key]={
                src:item
            }
        }
        //如果格式不满足期望，则丢弃此条数据
        if(!item || !item.src){
            continue;
        }
        count++;
        //设置图片Id
        item.id="__img__"+key+getId();
        //设置图片元素的img 它是一个image对象
        item.img=window[item.id]=new Image();

        doLoad(item);
    }

    if(!count){
        callback(success);
    }else if(timeout){
        timeoutId=setTimeout(onTimeout,timeout);
    }

    /**
     *真正进行图片加载函数
     * @param item 图片元素对象
     */
    function doLoad(item){
        item.status="loading";
        var img=item.img;
        //图片加载成功
        img.onload=function(){
            success = success & true;
            item.status="loaded";
            done();
        }
        //图片加载失败
        img.onerror=function(){
            success=false;
            item.status="error";
            done();
        }

        img.src=item.src;

        /**
         * 每张图片加载完成
         */
        function done(){
            img.onload=img.onerror=null;
            try {
                delete window[item.id];
            }catch (e){

            }

            if(!--count && !isTimeout){
                clearTimeout(timeoutId);
                callback(success);
            }
        }
    }

    /**
     * 超时函数
     */
    function onTimeout(){
        isTimeout=true;
        callback(false);
    }
}

var __id=0;
/**
 * 获取一个唯一的id
 * @returns {number}
 */
function getId(){
    return ++__id;
}

module.exports=loadImage;
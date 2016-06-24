(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["animation"] = factory();
	else
		root["animation"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by Administrator on 2016/6/12.
	 */
	"use strict";

	var loadImage=__webpack_require__(1);
	var Timeline=__webpack_require__(2);

	//初始化状态
	var STATE_INITIAL=0;
	//开始状态
	var STATE_START=1;
	//结束状态
	var STATE_STOP=2;
	//同步任务
	var TASK_SYNC = 0;
	//异步任务
	var TASk_ASYNC = 1;

	/**
	 * 简单的函数封装 执行callback
	 * @param callback
	 */
	function next(callback){
	    callback && callback();
	}


	/**
	 * 桢动画库类
	 * @constructor
	 */
	function Animation(){
	    this.taskQueue=[];
	    this.index=0;
	    this.timeline=new Timeline();
	    this.state=STATE_INITIAL;
	};

	/**
	 * 添加一个同步任务，去添加一个图片数组
	 * @param imglist
	 */
	Animation.prototype.loadImage=function(imglist){
	    var taskFn=function(next){
	        loadImage(imglist.slice(),next);
	    };
	    var type=TASK_SYNC;

	    return this._add(taskFn, type);
	};

	/**
	 * 添加一个异步定时任务，通过该定时改变图片背景位置，实现桢动画
	 * @param ele
	 * @param positions
	 * @param imageUrl
	 */
	Animation.prototype.changePosition=function(ele,positions,imageUrl){
	    var len=positions.length;
	    var taskFn;
	    var type;
	    var me=this;
	    if(len){
	        taskFn=function(next,time){
	            if(imageUrl) {
	                ele.style.backgroundImage='url('+imageUrl+')';
	            }
	            var index=Math.min(time/me.interval | 0,len-1);
	            var positon = positions[index].split(' ');
	            ele.style.backgroundPosition = positon[0]+'px '+positon[1]+'px';
	            if(index === len-1){
	                next();
	            }
	            type=TASk_ASYNC;
	        }
	    }else{
	        taskFn=next;
	        type=TASK_SYNC;
	    }
	    return this._add(taskFn,type);
	};

	/**
	 * 添加一个异步定时任务，通过定时改变image标签的的src标签，实现桢动画
	 * @param ele
	 * @param imglist
	 */
	Animation.prototype.changeSrc=function(ele,imglist){
	    var len=imglist.length;
	    var taskFn;
	    var type;
	    var me=this;
	    if(len){
	        taskFn=function(next,time){
	            //获取当前图片的索引
	            var index=Math.min(time / me.interval | 0 , len-1);
	            //改变image对象的图片url
	            ele.src=imglist[index];
	            if(index === len-1){
	                next();
	            }
	            type=TASk_ASYNC;
	        }
	    }else{
	        taskFn=next;
	        type=TASK_SYNC;
	    }
	    return this._add(taskFn,type);
	};

	/**
	 * 高级用法，添加一个异步定时执行的任务，
	 * 该任务自定义动画每桢执行的任务函数
	 * @param taskFn
	 */
	Animation.prototype.enterFrame=function(taskFn){
	    return this._add(taskFn,TASk_ASYNC);
	};

	/**
	 * 添加一个同步任务，可以在上一个任务完成后执行的回调函数
	 * @param callback
	 */
	Animation.prototype.then=function(callback){
	    var taskFn=function(next){
	        callback();
	        next();
	    }
	    var type=TASK_SYNC;
	    return this._add(taskFn,type);
	};

	/**
	 * 开始执行任务
	 * @param interval
	 */
	Animation.prototype.start=function(interval){
	    if(this.state === STATE_START){
	        return this;
	    }
	    if(!this.taskQueue.length){
	        return this;
	    }
	    this.state = STATE_START;
	    this.interval =interval;
	    this._runTask();
	    return this;
	};

	/**
	 * 添加一个同步任务，该任务就是回退到上一个任务中，
	 * 实现重复上一个任务的效果，可以定义重复的次数
	 * @param times
	 */
	Animation.prototype.repeat=function(times){
	    var me=this;
	    var taskFn=function(){
	        if(typeof times === "undefined"){
	            //无限回退上一个任务
	            me.index--;
	            me._runTask();
	            return;
	        }
	        if(times){
	            times--;
	            //回退
	            me.index--;
	            me._runTask();
	        }else{
	            //达到重复次数，跳到下一个任务
	            var task=me.taskQueue[me.index];
	            me._next(task);
	        }
	    }
	    var type=TASK_SYNC;
	    return this._add(taskFn,type);
	};

	/**
	 * 添加一个同步任务，相当于repeat()更有好的接口 无限循环上一次任务
	 */
	Animation.prototype.repeatForever=function(){
	    return this.repeat();
	};

	/**
	 *
	 * @param time
	 */
	Animation.prototype.wait=function(time){
	    if(this.taskQueue && this.taskQueue.length>0){
	        this.taskQueue[this.taskQueue.length-1].wait=time;
	    }
	    return this;
	};

	/**
	 *暂停当前动画
	 */
	Animation.prototype.pause=function(){
	    if(this.state===STATE_START){
	        this.timeline.stop();
	        this.state=STATE_STOP;
	    }
	    return this;
	};

	/**
	 *重新开始动画
	 */
	Animation.prototype.restart=function(){
	    if(this.state===STATE_STOP){
	        this.state = STATE_START;
	        this.timeline.restart();
	    }
	    return this;
	};

	/**
	 *释放资源
	 */
	Animation.prototype.dispose=function(){
	    if(this.state !== STATE_INITIAL){
	        this.state = STATE_INITIAL;
	        this.taskQueue =null;
	        this.timeline.stop();
	        this.timeline=null;
	    }
	    return this;
	};

	/**
	 * 添加一个任务到队列中
	 * @param taskFn
	 * @param type
	 * @private
	 */
	Animation.prototype._add=function(taskFn, type){
	    this.taskQueue.push({
	        taskFn: taskFn,
	        type: type
	    });
	    return this;
	};

	/**
	 * 执行任务
	 * @private
	 */
	Animation.prototype._runTask=function(){
	    if(!this.taskQueue || this.state!==STATE_START){
	        return;
	    };
	    //任务执行完毕
	    if(this.index=== this.taskQueue.length){
	        this.dispose();
	        return;
	    }
	    //获取任务链上的当前任务
	    var task = this.taskQueue[this.index];
	    if(task.type === TASK_SYNC){
	        this._syncTask(task);
	    }else{
	        this._asyncTask(task);
	    }
	};

	/**
	 * 同步任务
	 * @param task
	 * @private
	 */
	Animation.prototype._syncTask=function(task){
	    var me=this;
	    var next=function(){
	        //切换到下一个任务
	        me._next(task);
	    };
	    var taskFn=task.taskFn;
	    taskFn(next)
	};

	/**
	 * 切换到下一个任务,支持如果当前任务需要等待，则延时执行
	 * @param task
	 * @private
	 */
	Animation.prototype._next=function(task){
	    this.index++;
	    var me=this;
	    task.wait? setTimeout(function(){
	        me._runTask();
	    },task.wait):this._runTask();
	};

	/**
	 * 异步执行一个任务
	 * @param task
	 * @private
	 */
	Animation.prototype._asyncTask=function(task){
	    var me=this;
	    //定义每一桢执行的函数
	    var enterFrame=function(time){
	        var taskFn=task.taskFn;
	        var next=function(){
	            me.timeline.stop();
	            me._next(task);
	        }
	        taskFn(next,time);
	    }

	    this.timeline.onenterFrame=enterFrame;
	    this.timeline.start(this.interval);
	};

	module.exports=function(){
	    return new Animation();
	}



/***/ },
/* 1 */
/***/ function(module, exports) {

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

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Created by Administrator on 2016/6/13.
	 */
	"use strict";

	var DEFAULT_INTERVAL = 1000 / 60;

	var STATE_INITIAL = 0;
	var STATE_START = 1;
	var STATE_STOP = 2;

	/**
	 * raf
	 */
	var requestAnimationFrame = function () {
	    return window.requestAnimationFrame ||
	        window.webkitRequestAnimationFrame ||
	        window.mozRequestAnimationFrame ||
	        window.oRequestAnimationFrame ||
	        function (callback) {
	            return window.setTimeout(callback, callback.interval || DEFAULT_INTERVAL);
	        };
	}();

	/**
	 * craf
	 */
	var cancelRequestAnimationFrame = function () {
	    return window.cancelRequestAnimationFrame ||
	        window.webkitCancelAnimationFrame ||
	        window.mozCancelAnimationFrame ||
	        window.oCancelAnimationFrame ||
	        function (id) {
	            return window.clearTimeout(id);
	        };
	}();

	/**
	 * Timeline 时间轴类
	 * @constructor
	 */
	function Timeline() {
	    this.animationHandler = 0;
	    this.state = STATE_INITIAL;
	}

	/**
	 * 时间轴上每一次回调执行的函数
	 * @param time 从动画开始到当前执行的时间
	 */
	Timeline.prototype.onenterFrame = function (time) {

	}

	/**
	 * 动画开始
	 * @param interval 每一次回调的时间间隔
	 */
	Timeline.prototype.start = function (interval) {
	    if (this.state === STATE_START) return;
	    this.state = STATE_START;
	    this.interval = interval || DEFAULT_INTERVAL;
	    startTimeline(this, +new Date());
	}

	/**
	 * 时间轴动画启动函数
	 * @param timeline 时间轴实例
	 * @param startTime 动画开始的时间抽
	 */
	function startTimeline(timeline, startTime) {
	    timeline.startTime = startTime;
	    nextTick.interval = timeline.interval;
	    var lastTick = +new Date();
	    nextTick();
	    /**
	     * 每一桢执行的函数
	     */
	    function nextTick() {
	        var now = +new Date();

	        timeline.animationHandler = requestAnimationFrame(nextTick);

	        if (now - lastTick >= timeline.interval) {
	            timeline.onenterFrame(now - startTime);
	            lastTick = now;
	        }
	    }
	}

	/**
	 * 停止动画
	 */
	Timeline.prototype.stop = function () {
	    if (this.state != STATE_START) {
	        return;
	    }
	    this.state = STATE_STOP;
	    if (this.startTime) {
	        this.dur = +new Date() - this.startTime;
	        cancelRequestAnimationFrame(this.animationHandler);
	    }

	}

	/**
	 * 重新开始动画
	 */
	Timeline.prototype.restart = function () {
	    if (this.state === STATE_START) {
	        return;
	    }
	    if (!this.dur || !this.interval) {
	        return;
	    }
	    this.state = STATE_START;
	    startTimeline(this, +new Date() - this.dur)
	}

	module.exports = Timeline;

/***/ }
/******/ ])
});
;
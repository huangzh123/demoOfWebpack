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
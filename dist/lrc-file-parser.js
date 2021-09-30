/*!
 * lrc-file-parser.js v1.2.1
 * Author: lyswhut
 * Github: https://github.com/lyswhut/lrc-file-parser
 * License: MIT
 */
!function(i,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define("Lyric",[],t):"object"==typeof exports?exports.Lyric=t():i.Lyric=t()}(self,(function(){return i={579:i=>{function t(i){return function(i){if(Array.isArray(i))return e(i)}(i)||function(i){if("undefined"!=typeof Symbol&&null!=i[Symbol.iterator]||null!=i["@@iterator"])return Array.from(i)}(i)||function(i,t){if(i){if("string"==typeof i)return e(i,t);var n=Object.prototype.toString.call(i).slice(8,-1);return"Object"===n&&i.constructor&&(n=i.constructor.name),"Map"===n||"Set"===n?Array.from(i):"Arguments"===n||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)?e(i,t):void 0}}(i)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}()}function e(i,t){(null==t||t>i.length)&&(t=i.length);for(var e=0,n=new Array(t);e<t;e++)n[e]=i[e];return n}function n(i,t){if(!(i instanceof t))throw new TypeError("Cannot call a class as a function")}function r(i,t){for(var e=0;e<t.length;e++){var n=t[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(i,n.key,n)}}function s(i){return(s="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(i){return typeof i}:function(i){return i&&"function"==typeof Symbol&&i.constructor===Symbol&&i!==Symbol.prototype?"symbol":typeof i})(i)}var o=/^\[([\d:.]*)\]{1}/g,a={title:"ti",artist:"ar",album:"al",offset:"offset",by:"by"},u="object"==("undefined"==typeof performance?"undefined":s(performance))&&performance.now?performance.now.bind(performance):Date.now.bind(Date),l={invokeTime:0,animationFrameId:null,timeoutId:null,callback:null,thresholdTime:200,run:function(){var i=this;this.animationFrameId=window.requestAnimationFrame((function(){i.animationFrameId=null;var t=i.invokeTime-u();if(t>0)return t<i.thresholdTime?i.run():i.timeoutId=setTimeout((function(){i.timeoutId=null,i.run()}),t-i.thresholdTime);i.callback(t)}))},start:function(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:function(){},t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0;this.callback=i,this.invokeTime=u()+t,this.run()},clear:function(){this.animationFrameId&&(window.cancelAnimationFrame(this.animationFrameId),this.animationFrameId=null),this.timeoutId&&(window.clearTimeout(this.timeoutId),this.timeoutId=null)}};i.exports=function(){function i(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},e=t.lyric,r=void 0===e?"":e,s=t.translationLyric,o=void 0===s?"":s,a=t.offset,u=void 0===a?150:a,l=t.onPlay,f=void 0===l?function(){}:l,h=t.onSetLyric,c=void 0===h?function(){}:h,m=t.isRemoveBlankLine,y=void 0===m||m;n(this,i),this.lyric=r,this.translationLyric=o,this.tags={},this.lines=null,this.onPlay=f,this.onSetLyric=c,this.isPlay=!1,this.curLineNum=0,this.maxLine=0,this.offset=u,this.isOffseted=!1,this._performanceTime=0,this._performanceOffsetTime=0,this.isRemoveBlankLine=y,this._init()}var e,s,f;return e=i,(s=[{key:"_init",value:function(){null==this.lyric&&(this.lyric=""),null==this.translationLyric&&(this.translationLyric=""),this._initTag(),this._initLines(),this.onSetLyric(this.lines)}},{key:"_initTag",value:function(){for(var i in a){var t=this.lyric.match(new RegExp("\\[".concat(a[i],":([^\\]]*)]"),"i"));this.tags[i]=t&&t[1]||""}}},{key:"_initLines",value:function(){this.lines=[];for(var i=this.lyric.split(/\r\n|\n|\r/),e={},n=i.length,r=0;r<n;r++){var s=i[r].trim();if(o.exec(s)){var a=s.replace(o,"").trim();if(a||!this.isRemoveBlankLine){var u=RegExp.$1,l=u.split(":");l.length<3&&l.unshift(0),l[2].indexOf(".")>-1&&(l.push.apply(l,t(l[2].split("."))),l.splice(2,1)),e[u]={time:60*parseInt(l[0])*60*1e3+60*parseInt(l[1])*1e3+1e3*parseInt(l[2])+parseInt(l[3]||0),text:a}}}}for(var f=this.translationLyric.split(/\r\n|\n|\r/),h=f.length,c=0;c<h;c++){var m=f[c].trim();if(o.exec(m)){var y=m.replace(o,"").trim();if(y||!this.isRemoveBlankLine){var p=e[RegExp.$1];p&&(p.translation=y)}}}this.lines=Object.values(e),this.lines.sort((function(i,t){return i.time-t.time})),this.maxLine=this.lines.length-1}},{key:"_currentTime",value:function(){return u()-this._performanceTime+this._performanceOffsetTime}},{key:"_findCurLineNum",value:function(i){for(var t=this.lines.length,e=0;e<t;e++)if(i<=this.lines[e].time)return 0===e?0:e-1;return t-1}},{key:"_handleMaxLine",value:function(){this.onPlay(this.curLineNum,this.lines[this.curLineNum].text),this.pause()}},{key:"_refresh",value:function(){var i=this;if(this.curLineNum++,this.curLineNum>=this.maxLine)return this._handleMaxLine();var t=this.lines[this.curLineNum],e=this.lines[this.curLineNum+1],n=this._currentTime(),r=n-t.time;if((r>=0||0===this.curLineNum)&&(this.delay=e.time-t.time-r,this.delay>0))return!this.isOffseted&&this.delay>=this.offset&&(this._performanceOffsetTime+=this.offset,this.delay-=this.offset,this.isOffseted=!0),l.start((function(){i._refresh()}),this.delay),void this.onPlay(this.curLineNum,t.text);this.curLineNum=this._findCurLineNum(n)-1,this._refresh()}},{key:"play",value:function(){var i=arguments.length>0&&void 0!==arguments[0]?arguments[0]:0;this.lines.length&&(this.pause(),this.isPlay=!0,this._performanceOffsetTime=0,this._performanceTime=u()-i,this._performanceTime<0&&(this._performanceOffsetTime=-this._performanceTime,this._performanceTime=0),this.curLineNum=this._findCurLineNum(i)-1,this._refresh())}},{key:"pause",value:function(){if(this.isPlay&&(this.isPlay=!1,this.isOffseted=!1,l.clear(),this.curLineNum!==this.maxLine)){var i=this._findCurLineNum(this._currentTime());this.curLineNum!==i&&(this.curLineNum=i,this.onPlay(i,this.lines[i].text))}}},{key:"setLyric",value:function(i,t){this.isPlay&&this.pause(),this.lyric=i,this.translationLyric=t,this._init()}}])&&r(e.prototype,s),f&&r(e,f),i}()}},t={},function e(n){var r=t[n];if(void 0!==r)return r.exports;var s=t[n]={exports:{}};return i[n](s,s.exports,e),s.exports}(579);var i,t}));
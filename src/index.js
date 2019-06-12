const timeExp = /^\[([\d|:|\.]*)\]{1}/g
const tagRegMap = {
  title: 'ti',
  artist: 'ar',
  album: 'al',
  offset: 'offset',
  by: 'by'
}

const getNow = performance.now ? performance.now.bind(performance) :  Date.now.bind(Date)

// const timeoutTools = {
//   expected: 0,
//   interval: 0,
//   timeoutId: null,
//   callback: null,
//   step() {
//     var dt = getNow() - this.expected // the drift (positive for overshooting)
//     if (dt > this.interval) {
//         // something really bad happened. Maybe the browser (tab) was inactive?
//         // possibly special handling to avoid futile "catch up" run
//     }
//     // … // do what is to be done

//     this.callback()
  
//     this.expected += this.interval
//     this.timeoutId = setTimeout(() => {
//       this.step()
//     }, Math.max(0, this.interval - dt)) // take into account drift
//   },
//   start(callback = () => {}, interval = 1000) {
//     this.callback = callback
//     this.interval = interval
//     this.expected = getNow() + interval
//     this.timeoutId = setTimeout(() => {
//       this.step()
//     } ,interval)
//   },
//   stop() {
//     if (this.timeoutId == null) return 
//     clearTimeout(this.timeoutId)
//     this.timeoutId = null
//   }
// }

const timeoutTools = {
  invokeTime: 0,
  animationFrameId: null,
  timeoutId: null,
  callback: null,
  drift: null,
  isDrifted: false,
  thresholdTime: 1000,

  run() {
    this.animationFrameId = window.requestAnimationFrame(() => {
      let diff = parseInt(this.invokeTime - getNow())
      // console.log(diff)
      if (diff > 0) {
        if (diff < this.thresholdTime) return this.run()
        return this.timeoutId = setTimeout(() => {
          this.run()
          this.timeoutId = null
        }, diff - 800)
      }

      // if (getNow() < this.invokeTime) return this.run()

      diff *= -1
      // console.log('diff', diff)
      
      if (diff > 50) { // 时间不对，触发矫正函数
        this.isDrifted = true
        // console.log('修复时间漂移，漂移时间：', getNow() - this.invokeTime)
        this.drift(diff)
        return
      }
      // console.log('diff', diff)

      this.callback(diff)
      this.animationFrameId = null
    })
  },
  start(callback = () => {}, drift = () => {}, timeout = 1000) {
    // console.log(timeout)
    this.callback = callback
    this.drift = drift
    this.invokeTime = getNow() + timeout
    this.isDrifted = false

    this.run()
  },
  clear(drift) {
    if (this.animationFrameId == null && this.timeoutId == null) return 
    if (this.animationFrameId) {
      window.cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }
    if (this.timeoutId) {
      window.clearTimeout(this.timeoutId)
      this.timeoutId = null
    }

    if (!this.isDrifted && drift && getNow() - this.invokeTime > 100) {// 时间不对，触发矫正函数
      // console.log('修复时间漂移，漂移时间：', getNow() - this.invokeTime)
      drift(getNow() - this.invokeTime)
      return
    }
  }
}


module.exports = class Lyric {
  constructor({ lyric = '', offset = 150, onPlay = function () { }, onSetLyric = function () { } } = {}) {
    this.lyric = lyric
    this.tags = {}
    this.lines = null
    this.onPlay = onPlay
    this.onSetLyric = onSetLyric
    this.isPlay = false
    this.curLineNum = 0
    this.maxLine = 0
    this.offset = offset
    this.isOffseted = false
    this._init()
  }
  _init() {
    if (!this.lyric) return
    this._initTag()
    this._initLines()
    this.onSetLyric(this.lines)
  }
  _initTag() {
    for (let tag in tagRegMap) {
      const matches = this.lyric.match(new RegExp(`\\[${tagRegMap[tag]}:([^\\]]*)]`, 'i'))
      this.tags[tag] = matches && matches[1] || ''
    }
  }
  _initLines() {
    this.lines = []
    const lines = this.lyric.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      let result = timeExp.exec(line)
      if (result) {
        const text = line.replace(timeExp, '').trim()
        if (text) {
          const timeArr = RegExp.$1.split(':')
          if (timeArr.length < 3) timeArr.unshift(0)
          if (timeArr[2].indexOf('.') > -1) {
            timeArr.push(...timeArr[2].split('.'))
            timeArr.splice(2, 1)
          }
          this.lines.push({
            time: timeArr[0] * 60 * 60 * 1000 + timeArr[1] * 60 * 1000 + timeArr[2] * 1000 + (timeArr[3] || 0) * 10,
            text
          })
        }
      }
    }
    this.lines.sort((a, b) => {
      return a.time - b.time
    })
    this.maxLine = this.lines.length - 1
  }
  _findCurLineNum(curTime) {
    const length = this.lines.length
    for (let index = 0; index < length; index++) if (curTime <= this.lines[index].time) return index === 0 ? 0 : index - 1
    return length - 1
  }

  _refresh(driftTime) {
    this.curLineNum++
    // console.log('curLineNum time', this.lines[this.curLineNum].time)
    this.onPlay(this.curLineNum, this.lines[this.curLineNum].text)
    if (this.curLineNum === this.maxLine) return this.pause()
    this.delay = this.lines[this.curLineNum + 1].time - this.lines[this.curLineNum].time - driftTime
    if (!this.isOffseted && this.delay >= this.offset) {
      this.delay -= this.offset
      this.isOffseted = true
    }
    if (this.delay <= 0) return this._refresh(this.delay)

    timeoutTools.start(driftTime => {
      this._refresh(driftTime)
    }, driftTime => {
      this.play(this.lines[this.curLineNum + 1].time + driftTime)
    }, this.delay)
  }

  play(curTime = 0) {
    if (!this.lines.length) return
    this.pause()
    this.isPlay = true

    this.curLineNum = this._findCurLineNum(curTime)

    this.onPlay(this.curLineNum, this.lines[this.curLineNum].text)

    if (this.curLineNum === this.maxLine) return this.pause()

    this.delay = this.lines[this.curLineNum + 1].time - curTime
    if (this.delay >= this.offset) {
      this.delay -= this.offset
      this.isOffseted = true
    }
    // console.log(this.delay);

    if (this.delay < 0) return
    timeoutTools.start(driftTime => {
      this._refresh(driftTime)
    }, driftTime => {
      this.play(this.lines[this.curLineNum + 1].time + driftTime)
    }, this.delay)
  }
  pause() {
    if (!this.isPlay) return

    timeoutTools.clear(driftTime => {
      if (this.curLineNum === this.maxLine) return
      let curLineNum = this._findCurLineNum(this.lines[this.curLineNum + 1].time + driftTime)
      this.onPlay(curLineNum, this.lines[curLineNum].text)
    })

    // clearTimeout(this.timer)
    this.isPlay = false
    this.isOffseted = false
  }
  setLyric(lyric) {
    if (this.isPlay) this.pause()
    this.lyric = lyric
    this._init()
  }
}

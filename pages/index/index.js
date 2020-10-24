//index.js
//获取应用实例
const app = getApp()
var util = require('../../utils/util.js');
Page({
  data: {
    time2: 0,
    time3: 0,
    time4: 0,
    tmpTime:0,
    setIntervalId:0,
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    userButton: '开始',
    newNum: '',
    opid:''
  },
  /**
   * 图片单击提示
   */
  clickImg:function(){
    wx.showToast({
      title: '累积到1万小时,即可点亮徽章',
      icon: 'none',
      duration: 2000
    })
  },
  /**
 * 生命周期函数--监听页面初次渲染完成
 */
  onReady: function () {
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
    let that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'sum',
      success: function (res) {
        console.log('云函数返回',res)
        that.setData({
          opid: res.result.openid,
        })
        console.log('console.log(that)', that)
        const db = wx.cloud.database({ env: 'lixin-5456985' });
        const $ = db.command.aggregate
        db.collection('getting_fit').aggregate().match({
          _openid: that.data.opid,
        })
          .group({
            _id: null,
            num4: $.sum('$num4'),
            num3: $.sum('$num3'),
            num2: $.sum('$num2'),
          }).end().then(res => {
            that.viewTime(res.list[0].num2, res.list[0].num3, res.list[0].num4)
            console.log('res', res)
          })
      }
      
    })
  },
  //取消事件
  _cancelEvent() {
    this.dialog.hideDialog();
  },
  //确认事件
  _confirmEvent() {
    this.dialog.hideDialog();
    const db = wx.cloud.database({ env: 'lixin-5456985'});
    db.collection('getting_fit').add({
      data:{
        timeAndCount: this.data.time2 + ":" + this.data.time3 + this.data.time4,//时长和次数
        num2: this.data.time2,
        num3: this.data.time3,
        num4: this.data.time4,
        time: util.formatTime(new Date()),//时间戳
        jobName: this.dialog.data.inputValue,//任务名称
        jobState: '1',//任务状态
        jobType: true,//任务类型
        date: util.formatdata(new Date()),
        dateTime: util.formatdata(new Date()) + " " + util.formatTime(new Date())

      },
      success: function (res) {
        console.log(res)
      }
    })
    this.refrseshTime()
  },
  refrseshTime: function(){
    this.setData({
      userButton: '开始',
      time2: 0,
      time3: 0,
      time4: 0
    })
    this.dialog.setData({ inputValue: '' })  
  },
  //打开保存窗口
  modalinput: function () {
    this.dialog.showDialog(this.data.opid,true);
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //按钮处理函数
  startTap:function(){
    if (this.data.userButton === '暂停'){
      this.setData({ userButton: '继续' })
      clearInterval(this.data.setIntervalId);
    }else{
      this.getTime()
      this.setData({ userButton: '暂停' })
      this.data.setIntervalId = setInterval(this.getTime, 1000)
    }
  },
  /**
  * 时间总数回显
  */
  viewTime: function (num2, num3, num4) {
    if (num4 / 10 > 1) {
      num3 += num4 / 10
    }
    if (num3 / 6 > 1) {
      num2 += num3 / 6
    }
    if (num2 < 60) {
      this.setData({
        newNum: 0
      })
    } else {
      let newNum = (num2 / 60) +''
      newNum = newNum.substring(0, newNum.indexOf('.'))
      this.setData({
        newNum: newNum
      })
    }
  },
  //定时器函数
  getTime: function () {
    if (this.data.time3 == 5 && this.data.time4 == 9) {
      this.data.time4 = 0;
      this.data.time3 = 0;
      this.data.time2++;
      this.setData({ time3: this.data.time3 })
      this.setData({ time2: this.data.time2 })
    }
    if (this.data.time4 == 9) {
      this.data.time4 = 0;
      this.data.time3++;
      this.setData({ time3: this.data.time3 })
      this.setData({ time4: this.data.time4 })
      return
    }
    this.data.time4++;
    this.setData({ time4: this.data.time4 })

 
  },

  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse){
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  /**
 * 生命周期函数--监听页面显示
 */
  onShow: function () {
    if (this.data.tmpTime >0 ){
     let nowTime = Date.parse(new Date())
     let value = (nowTime - this.data.tmpTime)/1000
      if (value >= 60){
        let m = (value/ 60).toString()
        let newNum = Number(m.substring(0, m.indexOf('.')))
        this.data.time2 += newNum
        this.setData({ time2: this.data.time2 })
      }else{
        let newNum = value+ ''
        if(newNum.length>1){
          this.data.time4 += Number(newNum.substring(1, 2))
          if (this.data.time4 >= 10) {
            this.data.time4 = this.data.time4 - 10
            this.data.time3++
            this.setData({ time4: this.data.time4 })
            this.setData({ time3: this.data.time3 })
          }
          this.data.time3 += Number(newNum.substring(0, 1))
          if (this.data.time3>=6){
            this.data.time3 = this.data.time3 - 6
            this.data.time2++
            this.setData({ time2: this.data.time2 })
            this.setData({ time3: this.data.time3 })
          }
        }else{
          this.data.time4 += Number(value)
          if (this.data.time4 >= 10) {
            this.data.time4 = this.data.time4 - 10
            this.data.time3++
            this.setData({ time4: this.data.time4 })
            this.setData({ time3: this.data.time3 })
          }
        }
      }
      this.setData({ tmpTime: 0 })
      this.startTap()
    }else{
      this.onReady()
    }
  },
  /**
* 生命周期函数--监听页面隐藏
*/
  onHide: function () {
    console.log
    if (this.data.time2 != 0 || this.data.time3 != 0 || this.data.time4 != 0){
      this.startTap()
      this.setData({
        tmpTime: Date.parse(new Date()),
      })
    }
  },
})

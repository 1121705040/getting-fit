// pages/userConfig/userConfig.js
const app = getApp()
var util = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    stateVal:'',
    userInputInfo:'',
    opid:'',
    ztime: '',
    newNum: 0
  },

  infoSubmit:function(){
    if (this.data.userInputInfo){
      wx.showToast({
        title: '已提交',
        icon: 'success',
        duration: 1000
      })
      this.setData({
        stateVal: ''
      })
      let that = this
      const db = wx.cloud.database({ env: 'lixin-5456985' });
      db.collection('user_feedback').add({
        data: {
          dateTime: util.formatdata(new Date()) + " " + util.formatTime(new Date()),//时间戳
          feedbackContent: that.data.userInputInfo,//反馈内容
          State: '1',//状态
        }
      }).then(res => {
        console.log('res', res)
        that.setData({
          userInputInfo: ''
        })
      })
    }else{
      wx.showToast({
        title: '请输入内容',
        icon: 'none',
        duration: 2000
      })
    }
  },
  bindTextAreaBlur:function(e){
    this.setData({
      userInputInfo: e.detail.value
    })
  },
  openInfoInput: function(e){
    if (e.currentTarget.id === this.data.stateVal){
      this.setData({
        stateVal:''
      })
    }else{
      this.setData({
        stateVal: e.currentTarget.id
      })
    }
  },

  openMore: function(){
    wx.showToast({
      title: '玩命开发中',
      icon: 'none',
      duration: 300
    })
  },
  /**
 * 图片单击提示
 */
  clickImg: function () {
    wx.showToast({
      title: '累积到1万小时,即可点亮徽章',
      icon: 'none',
      duration: 2000
    })
  },
  clickImg2: function () {
    wx.showToast({
      title: '累积到1万个/次,即可点亮徽章',
      icon: 'none',
      duration: 2000
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
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
  getUserInfo: function (e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'sum',
      success: function (res) {
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
            num1: $.sum('$num1'),
            count: $.sum('$timeAndCount')
          }).end().then(res => {
            that.setData({
              zcount: res.list[0].count
            })
            that.viewTime(res.list[0].num1, res.list[0].num2, res.list[0].num3, res.list[0].num4)
            console.log('res', res)
          })
      }
    })
  },
  /**
  * 时间总数回显
  */
  viewTime: function (num1, num2, num3, num4) {
    if (num4 / 10 > 1) {
      num3 += num4 / 10
    }
    if (num3 / 6 > 1) {
      num2 += num3 / 6
    }
    if (num2 / 10 > 1) {
      num1 += num2 / 10
    }
    if (num1 <= 60) {
      this.setData({
        newNum: 1
      })
    } else {
      this.setData({
        newNum: num1 / 60
      })
    }
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onReady()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
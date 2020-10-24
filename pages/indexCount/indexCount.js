// pages/indexCount/indexCount.js
const app = getApp()
var util = require('../../utils/util.js');

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    countValue:'',
    opid: '',
    ztime: '',
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
  //取消事件
  _cancelEvent() {
    this.dialog.hideDialog();
  },
  //确认事件
  _confirmEvent() {
    this.dialog.hideDialog();
    const db = wx.cloud.database({ env: 'lixin-5456985' });
    db.collection('getting_fit').add({
      data: {
        timeAndCount: parseInt(this.data.countValue),//时长和次数
        time: util.formatTime(new Date()),//时间戳
        jobName: this.dialog.data.inputValue,//任务名称
        jobState: '1',//任务状态
        jobType:false,//任务类型
        date: util.formatdata(new Date()),
        dateTime: util.formatdata(new Date()) + " " + util.formatTime(new Date())
      },
      success: function (res) {
        console.log(res)
      }
    })
    this.refrseshTime()
  },
  //清空输入框
  refrseshTime: function () {
    this.setData({
      countValue:''
    })
    this.dialog.setData({ inputValue: '' })
  },
  //count输入框value
  countInput: function(e){
    var regNum = new RegExp('[0-9]', 'g');
    if (regNum.exec(e.detail.value)){
      this.setData({
        countValue: e.detail.value
      })
    }else{
      this.setData({
        countValue: ''
      })
    }
  },
  //打开保存窗口
  modalinput: function () {
    if(this.data.countValue){
      this.dialog.showDialog(this.data.opid,false);
    }else{
      wx.showToast({
        title: '要输入数字哦！',
        icon: 'none',
        duration: 300
      })
    }
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
    //获得dialog组件
    this.dialog = this.selectComponent("#dialog");
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
            count: $.sum('$timeAndCount')
          }).end().then(res => {
            that.setData({
              zcount: res.list[0].count
            })
            console.log('res', res)
          })
      }
    })
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
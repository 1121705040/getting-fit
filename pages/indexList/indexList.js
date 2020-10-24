// pages/indexList/indexList.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    infoList: [],
    dateList:[],
    index:2,
    itemView:'',
    opid:'',
    limit:0,
    zcount: '',
    ztime: '',
    newNum:0,
  },
  //查询指定时间的数据
  selectItem: function(e){
    if (this.data.itemView === e.currentTarget.id){
      this.setData({
        itemView: ''
      })
    }else{
      let that = this
      console.log('console.log(that)',that)
      const db = wx.cloud.database({ env: 'lixin-5456985' });
      const $ = db.command.aggregate
      db.collection('getting_fit').where({
        _openid: that.data.opid,
        date: e.currentTarget.id
      }).orderBy('dateTime', 'desc').get().then(res => {
        that.setData({
          infoList: res.data,
          itemView: e.currentTarget.id
        })
      })
      db.collection('getting_fit').aggregate().match({
        _openid: that.data.opid,
        date: e.currentTarget.id
      })
        .group({
          _id: null,
          num4: $.sum('$num4'),
          num3: $.sum('$num3'),
          num2: $.sum('$num2'),
          count: $.sum('$timeAndCount')
        }).end().then(res=>{
          that.setData({
            zcount: res.list[0].count
          })
          that.viewTime(res.list[0].num2, res.list[0].num3, res.list[0].num4)
          console.log('res',res)
        })
    }
  },
  /**
   * 时间总数回显
   */
  viewTime: function (num2, num3, num4) {
    if (num4/10>1){
      num3 += num4 / 10
    }
    if (num3 / 6 > 1) {
      num2 += num3 / 6
    }
    if(num2<=60){
      this.setData({
        newNum: 0
      })
    }else{
      let newNum = num2 / 60 + ''
      newNum = newNum.substring(0, newNum.indexOf('.'))
      this.setData({
        newNum: newNum
      })
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showToast({
      title: '玩命加载中',
      icon: 'loading',
      duration: 300
    })
    this.getDateTime()
  },

  //获取hi时间列表
  getDateTime: function(){
    let that = this
    wx.cloud.callFunction({
      // 云函数名称
      name: 'sum',
      success: function (res) {
        that.setData({
          opid: res.result.openid,
        })
        const db = wx.cloud.database({ env: 'lixin-5456985' });
        db.collection('getting_fit').where({
          _openid: that.data.opid
        }).orderBy('date', 'desc')
          .skip(that.data.limit).limit(365).field({
            date: true,
          }).get().then(res => {
            // res.data 包含该记录的数据
            let arr = new Array();
            for (let i = 0; i < res.data.length; i++) {
              arr.push(res.data[i].date)
            }
            that.setData({
              dateList: Array.from(new Set(arr))
            })
          })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getDateTime()
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
    console.log("上拉")
    this.data.limit+=356
    this.setData({
      limit: this.data.limit
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
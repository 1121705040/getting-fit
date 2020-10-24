// components/dialog/dialog.js
Component({
  behaviors: ['wx://form-field'],

  /**
   * 组件的属性列表
   */
  properties: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },

  /**
     * 组件的属性列表
     * 用于组件自定义设置
     */
  properties: {
    // 弹窗标题
    title: {            // 属性名
      type: String,     // 类型（必填），目前接受的类型包括：String, Number, Boolean, Object, Array, null（表示任意类型）
      value: '标题'     // 属性初始值（可选），如果未指定则会根据类型选择一个
    },
    // 弹窗内容
    content: {
      type: String,
      value: '弹窗内容'
    },
    // 弹窗取消按钮文字
    cancelText: {
      type: String,
      value: '取消'
    },
    // 弹窗确认按钮文字
    confirmText: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 私有数据,组件的初始数据
   * 可用于模版渲染
   */
  data: {
    // 弹窗显示控制
    isShow: false,
    inputValue: '',
    nameList:[],
    showHistory:false
  },

  /**
   * 组件的方法列表
   * 更新属性和数据的方法与更新页面数据的方法类似
   */
  methods: {
    /*
     * 公有方法
     */
    toInput(e){
      console.log(e)
      this.setData({
        inputValue: e.currentTarget.id
      })
    },
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //展示弹框
    showDialog(opid,flag) {
      console.log('opid',opid)
      if(opid){
        let that = this
        const db = wx.cloud.database({ env: 'lixin-5456985' });
        db.collection('getting_fit').where(
          {
          _openid: opid,
           jobType: flag
          }
        ).orderBy('dateTime', 'desc')
          .skip(0).limit(7).field({
            jobName: true,
          }).get().then(res => {
            console.log(res.data)
            that.setData({
              nameList: res.data,
              showHistory:true
            })
          })
      }
      this.setData({
        isShow: !this.data.isShow
      })
    },
    /*
    * 内部私有方法建议以下划线开头
    * triggerEvent 用于触发事件
    */
    _cancelEvent() {
      //触发取消回调
      this.triggerEvent("cancelEvent")
    },
    _confirmEvent(e) {
      if (this.data.inputValue){
        //触发成功回调
        this.triggerEvent("confirmEvent");
        wx.showToast({
          title: '保存成功',
          icon: 'success',
          duration: 1000
        })
      }else{
        wx.showToast({
          title: '请输入内容',
          icon: 'none',
          duration: 300
        })
      }
    },
    //用户输入
    bindKeyInput(e){
      this.setData({
        inputValue: e.detail.value
      })
    }
  }
})

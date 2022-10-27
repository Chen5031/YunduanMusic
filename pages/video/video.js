// pages/video/video.js
import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList:[],//导航标签的数据
    navId:'',  //选中导航的标识
    videoList:[],//视频列表
    videoId:'',//视频的id标识
    videoUpdateTime:[],//视频播放的时长
    isTriggered:false,//标识下拉刷新是否被触发
    arr:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    //获取导航标签数据
    this.getVideoGroupListData();
  },
  //获取导航数据
  async getVideoGroupListData(){
    let VideoGroupListData = await request('/video/group/list');
    this.setData({
      videoGroupList:VideoGroupListData.data.slice(0,14),
      navId:VideoGroupListData.data[0].id
    })
    //获取视频列表数据
    this.getListDetail(this.data.navId);
  },
  //获取视频列表数据
  async getListDetail(navId){
    let videoDetails = await request('/video/group',{id:navId},'GET');
    let videoInfoList =[];
      for(const i of videoDetails.datas){
        videoInfoList.push({
          id:i.data.vid,
          coverUrl:i.data.coverUrl,
          title:i.data.title,
          creator:i.data.creator,
          commentCount:i.data.commentCount,
          praisedCount:i.data.praisedCount,
          videoUrl:""
        })
      }
 /*      videoDetails.datas.forEach(i =>{
        videoInfoList.push({
            id:i.data.vid,
            coverUrl:i.data.coverUrl,
            title:i.data.title,
            creator:i.data.creator,
            commentCount:i.data.commentCount,
            praisedCount:i.data.praisedCount,
            videoUrl:""
          })
        }) */
        for (const i of videoInfoList){
          let result =await request('/video/url',{id:i.id}).then(r =>{
              i.videoUrl = r.urls[0].url
          })
        }
    //关闭消息提示框
    wx.hideLoading();
    this.setData({
      videoList: videoInfoList,
      isTriggered:false,    //关闭下拉刷新
    })
  },
  // 点击切换导航的回调
  changeNav(event){
    let navId = event.currentTarget.id;//通过id向event传参的时候如果传的是number会自动转换成string
    this.setData({
      navId:navId*1,
      videoList:[]
    })
    //显示正在加载
    wx.showLoading({
      title:"正在加载",
      mask:'true'
    })
    //动态获取当前导航对应的视频数据
    this.getListDetail(this.data.navId)
  },
  //点击播放/继续播放的回调
  handlePlay(event){
    /* 需求：
        1,在点击播放的事件中需要找到上一个播放的视频
        2.在播放新的视颜之前关闭上一个正在播放的视频
      关键：
        1.如何找到上一个视频的实例对象
        2.如何确认正在播放的视频不是同一视频
    */
   let id = event.currentTarget.id;
  //  this.id !== id && this.videoContext && this.videoContext.stop();
  //  this.id = id;
   //更新data中video的状态数据
   this.setData({
     videoId:id
   })
   //创建控制video标签的实例对象
   this.videoContext = wx.createVideoContext(id);
   //判断当前视频之前是否播放过，如果有，则跳转至指定位置
    let {videoUpdateTime} = this.data;
    let videoItem = videoUpdateTime.find(item => item.id === id);
    if(videoItem){
      this.videoContext.seek(videoItem.currentTime);
    }
  },
  // 监听视频播放时长的回调
  handleTimeUpdate(event){
    let videoTimeObj = {id:event.currentTarget.id,currentTime:event.detail.currentTime};
    let {videoUpdateTime} = this.data;
    /* 思路：判断记录播放时长的videoUpdateTime数组中是否有当前视频的播放记录
        1.如果有，在原有的播放记录中修改播放时间为当前的播放时间
        2.如果没有，需要在数组中添加当前视频的播放对象 
    */
   let videoItem = videoUpdateTime.find(item => item.id ===  videoTimeObj.id);
   if(videoItem){//之前有
    videoItem.currentTime = event.detail.currentTime;
   }else {//之前没有
    videoUpdateTime.push(videoTimeObj);
   }
   //更新videoUpdateTime的状态
   this.setData({
     videoUpdateTime
   })
  },
  //视频播放结束时调用
  handleEnd(event){
    //移除播放时长数组中当前视频的对象
    let {videoUpdateTime} = this.data;
    videoUpdateTime.splice(videoUpdateTime.findIndex(item => item.id === event.currentTarget.id),1);
    this.setData({
      videoUpdateTime
    }) 
  },
  //自定义下拉刷新的回调：scroll-view
  handleRefresher(){
    //再次发起请求,获取最新的视频数据
    this.getListDetail(this.data.navId)
  },
  //自定义上拉触底的回调:scroll-view
  async handleToLower(){  //上拉加载
    let arr = this.data.arr
    let trigger = console.log('抛出的记录点');
    arr.push(trigger)
    let start = 0;
    for (let i = 0; i < arr.length; i++) {
      start++
    }
     let navId = this.data.navId
     let getVideoMoreListData = await request('/video/group',{id:navId,offset:start}) 
     let videoInfoList =[];
     for(const i of getVideoMoreListData.datas){
      videoInfoList.push({
        id:i.data.vid,
        coverUrl:i.data.coverUrl,
        title:i.data.title,
        creator:i.data.creator,
        commentCount:i.data.commentCount,
        praisedCount:i.data.praisedCount,
        videoUrl:""
      })
     }
/*       getVideoMoreListData.datas.forEach(i =>{
        videoInfoList.push({
            id:i.data.vid,
            coverUrl:i.data.coverUrl,
            title:i.data.title,
            creator:i.data.creator,
            commentCount:i.data.commentCount,
            praisedCount:i.data.praisedCount,
            videoUrl:""
          })
        }) */
        for (const i of videoInfoList){
          let result =await request('/video/url',{id:i.id}).then(r =>{
              i.videoUrl = r.urls[0].url
          })
        }
     let index = 0
     let videoMoreList = videoInfoList.map(item => {
       item.id = index++
       return item
     })
     let videoList = this.data.videoList
     videoList.push(...videoMoreList)
     this.setData({
      videoList
     })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage:function({from}) {
    console.log(from);
    if(from === 'button'){
      return{
        title:'来自button的转发',
        page:'/pages/video/video',
        imageUrl:'/static/images/nvsheng.jpg'
      }
    }else{
      return{
        title:'来自menu的转发',
        page:'/pages/video/video',
        imageUrl:'/static/images/nvsheng.jpg'
      }
    }
  }
})
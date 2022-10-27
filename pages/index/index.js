import request from '../../utils/request'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList:[],//轮播图数据
    recommendList:[],//推荐歌曲数据
    topList:[],//排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function(options) {
    //获取轮播图数据
    let bannerListData = await request('/banner',{type:2});
    this.setData({
      bannerList:bannerListData.banners
    })
    //获取推荐歌单数据
    let recommendListData = await request('/personalized',{limit:10});  
    this.setData({
      recommendList:recommendListData.result
    })
    //获取排行榜数据
    let allTopListData = await request('/toplist')
    let topList = allTopListData.list.slice(0, 9)
    let topListDetail = []
    for (let item of topList) {
      let detailList = await request(`/playlist/detail?id=${item.id}`, { limit: 10 })
      topListDetail.push({name: detailList.playlist.name, tracks: detailList.playlist.tracks.slice(0, 3)})
      this.setData({
        topList: topListDetail
      })
    } 
  },
  //跳转至recommendSong页面的回调
  toRecommendSong(){
    wx.navigateTo({
      url: '/songPackage/pages/recommendSong/recommendSong',
    })
  },
  //跳转至音乐搜索页面
  toSearch(){
    wx.navigateTo({
      url: '/pages/search/search',
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
  onShareAppMessage() {

  }
})
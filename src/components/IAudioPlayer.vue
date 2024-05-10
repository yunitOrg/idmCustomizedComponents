<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="ITabVertical_app">
    <template v-if="music_list && music_list.length">
      <div class="ITabVertical_app_header">
        {{ music_list[music_index] ? music_list[music_index].title : '泰山之声' }}
      </div>
      <div class="ITabVertical_app_main">
        <img :src="getImageSrc(music_list[music_index] ? music_list[music_index].image : '','taishan')" alt="">
        <div class="ITabVertical_app_main_body flex_column_center">
          <div class="row title">
            <SvgIcon icon-class="music"></SvgIcon>
            <span>{{ music_list[music_index] ? music_list[music_index].name : '名称' }}</span>
          </div>
          <div class="row">
            <span>音频</span>
            <span>{{ makeTimeFormat(duration) }}</span>
          </div>
        </div>
      </div>
      <div class="ITabVertical_app_footer flex_between">
        <div class="left flex_start">
            <SvgIcon @click.native="changeMusic(-1)" icon-class="last"></SvgIcon>
            <SvgIcon v-if="!isPlaying" @click.native="play()" icon-class="play"></SvgIcon>
            <SvgIcon v-else @click.native="stop()" icon-class="stop"></SvgIcon>
            <SvgIcon @click.native="changeMusic(1)" icon-class="next"></SvgIcon>
        </div>
        <div class="center flex_center">
          <span class="time currentTime">{{ makeTimeFormat(currentTime) }}</span>
          <a-slider v-model="currentTime" @change="changeMusicPercent()" :tipFormatter="tipFormatter" :min="0" :max="duration"  :default-value="0" :disabled="isChangeMusicPercentDisabled" />
          <span class="time duration">{{ makeTimeFormat(duration) }}</span>
        </div>
        <div @click.stop="" class="right">
          <SvgIcon @click.native.stop="toChangeVoice()" icon-class="voice"></SvgIcon>
          <div v-if="isShowVoicePop" class="slider_block">
            <a-slider v-model="current_voice" @change="changeVoice()" vertical />
          </div>
        </div>
      </div>
    </template>
    <div class="audio_block">
      <audio id="music" controls>
        <source :src="getMusicUrl(music_url)" type="audio/mpeg">
      </audio>
    </div>
  </div>
</template>

<script>
import SvgIcon from '../icons/SvgIcon.vue';
import { getMusicList } from "../mock/index";

import { getTabVerticalLeftList,getTabVerticalRightData } from '../mock/index'
export default {
  name: 'IAudioPlayer',
  components: {
    SvgIcon
  },
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        loadDataCreated: true
      },
      music_index: 0,
      music_list: [],
      music_url: '',
      musicDom: null,
      isPlaying: false,
      isChangeMusicPercentDisabled: true,
      duration: 0,
      currentTime: 0,
      isShowVoicePop: false,
      current_voice: 100
    }
  },
  watch: {
    
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
  },
  mounted() {
    let that = this;
    window.addEventListener('click',function(){
      that.isShowVoicePop = false;
    })
    this.initAudioEvent()
    if(this.propData.loadDataCreated) {
      this.getMusicList()
    }
  },
  destroyed() {},
  methods:{
    changeMusic(type) {
      let currentIndex = this.music_index;
      if(type == 1) {
        currentIndex++;
        if(currentIndex >= this.music_list.length) {
          currentIndex = 0;
        }
      } else {
        currentIndex--;
        if(currentIndex < 0) {
          currentIndex = 0;
        }
      }
      this.music_index = currentIndex;
      this.music_url = this.music_list[this.music_index] ? this.music_list[this.music_index].music : '';
      if(this.musicDom) {
        this.musicDom.src = this.getMusicUrl(this.music_url) ;
        this.musicDom.play()
        this.isPlaying = true;
      }
    },
    getMusicUrl(url) {
      if( url ) {
        return IDM.url.getWebPath(url);
      } else {
        return IDM.url.getModuleAssetsWebPath( require(`../music/music.mp3`), this.moduleObject );
      }
    },
    tipFormatter(e) {
      return this.makeTimeFormat(e)
    },
    changeMusicPercent() {
      if(this.musicDom) {
        this.musicDom.currentTime = this.currentTime;
      }
    },
    makeTimeFormat(time) {
      var minute = time / 60;
      var minutes = parseInt(minute);
      if (minutes < 10) {
        minutes = "0" + minutes;
      }
      var second = time % 60;
      var seconds = Math.round(second);
      if (seconds < 10) {
        seconds = "0" + seconds;
      }
      return `${minutes}:${seconds}`
    },
    initAudioEvent() {
      let music = document.getElementById("music");
      this.musicDom = music;
      music.addEventListener('timeupdate',() => {
        this.currentTime = music.currentTime;
        this.music_percent = music.currentTime;
      })
      music.addEventListener('ended',() => {
        this.makeAudioInitStatus()
        this.changeMusic(1)
      })
      music.oncanplay = () => {
        this.duration = music.duration;
        this.isChangeMusicPercentDisabled = false;
      }
    },
    makeAudioInitStatus() {
      if(this.musicDom) {
        this.musicDom.pause()
        this.currentTime = 0;
        this.isPlaying = false;
      }
    },
    toChangeVoice() {
      this.isShowVoicePop = !this.isShowVoicePop;
    },
    changeVoice(value) {
      if(this.musicDom) {
        this.musicDom.volume = this.current_voice / 100;
      }
    },
    play() {
      this.isPlaying = !this.isPlaying;
      this.musicDom && this.musicDom.play()
    },
    stop() {
      this.isPlaying = !this.isPlaying;
      this.musicDom && this.musicDom.pause()
    },
    getMusicList() {
      let that = this;
      let params = this.commonParam()
      if (this.propData.dataSource && this.propData.dataSource.length) {
        IDM.datasource.request(
          this.propData.dataSource[0].id,
          {
            moduleObject: this.moduleObject,
            _this: this,
            params
          }, function (res) {
            if (res && res.length) {
              that.music_list = res;
              that.music_index = 0;
              that.music_url = that.music_list[that.music_index] ? that.music_list[that.music_index].music : '';
            }
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      } else {
        that.music_index = 0;
        that.music_list = getMusicList()
      }
    },
    getImageSrc(url,name) {
      if ( url ) {
        return IDM.url.getWebPath(url)
      } else {
        return IDM.url.getModuleAssetsWebPath(require(`../assets/${name}.png`),this.moduleObject)
      }
    },
    makeParamsData(data) {
        let result = {};
        if ( this.propData.paramsMakeFunction && this.propData.paramsMakeFunction.length && window[this.propData.paramsMakeFunction[0].name] ) {
            result = window[this.propData.paramsMakeFunction[0].name].call(this, {
                                    ...data,
                                    ...this.propData.paramsMakeFunction[0].param,
                                    moduleObject: this.moduleObject,
                                    _this: this
                                });
            console.log('自定义参数函数',result)
            return result
        }
        return data
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.number = this.propData.numberCount ? this.propData.numberCount : 6;
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject(){
      var styleObject = {};
      if(this.propData.bgSize&&this.propData.bgSize=="custom"){
        styleObject["background-size"]=(this.propData.bgSizeWidth?this.propData.bgSizeWidth.inputVal+this.propData.bgSizeWidth.selectVal:"auto")+" "+(this.propData.bgSizeHeight?this.propData.bgSizeHeight.inputVal+this.propData.bgSizeHeight.selectVal:"auto")
      }else if(this.propData.bgSize){
        styleObject["background-size"]=this.propData.bgSize;
      }
      if(this.propData.positionX&&this.propData.positionX.inputVal){
        styleObject["background-position-x"]=this.propData.positionX.inputVal+this.propData.positionX.selectVal;
      }
      if(this.propData.positionY&&this.propData.positionY.inputVal){
        styleObject["background-position-y"]=this.propData.positionY.inputVal+this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key]=element;
              break;
            case "bgColor":
              if(element&&element.hex8){
                styleObject["background-color"]=element.hex8;
              }
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject,element)
              break;
            case "bgImgUrl":
              styleObject["background-image"]=`url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移
              
              break;
            case "positionY":
              //背景纵向偏移
              
              break;
            case "bgRepeat":
              //平铺模式
                styleObject["background-repeat"]=element;
              break;
            case "bgAttachment":
              //背景模式
                styleObject["background-attachment"]=element;
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject,element)
              break;
            case "font":
              IDM.style.setFontStyle(styleObject,element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id,styleObject);
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam(){
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        urlData: JSON.stringify(urlObject),
      };
      return params;
    },

    /**
     * 通用的获取表达式匹配后的结果
     */
    getExpressData(dataName,dataFiled,resultData){
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if(dataFiled){
        var filedExp = dataFiled;
        filedExp =
          dataName +
          (filedExp.startsWiths("[") ? "" : ".") +
          filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      //对结果进行再次函数自定义
      if(this.propData.customFunction&&this.propData.customFunction.length>0){
        var params = this.commonParam();
        var resValue = "";
        try {
          resValue = window[this.propData.customFunction[0].name]&&window[this.propData.customFunction[0].name].call(this,{
            ...params,
            ...this.propData.customFunction[0].param,
            moduleObject:this.moduleObject,
            expressData:_defaultVal,interfaceData:resultData
          });
        } catch (error) {
        }
        _defaultVal = resValue;
      }
      
      return _defaultVal;
    },
    /**
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object 
     */
    receiveBroadcastMessage(object){
      console.log("组件收到消息",object)
      if (object.type && object.type == "linkageResult") {
        let data_list = [];
        if (Array.isArray(object.message)) {
          data_list = object.message;
        } else if (object.message) {
          data_list = object.message[ this.propData.listData ? this.propData.listData : "list" ];
        }
        this.music_list = data_list;
        this.music_index = 0;
        this.music_url = this.music_list[this.music_index] ? this.music_list[this.music_index].music : '';
      }
    },
    /**
     * 组件通信：发送消息的方法
     * @param {
     *  type:"自己定义的，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）",
     *  message:{实际的消息对象},
     *  rangeModule:"为空发送给全部，根据配置的属性中设定的值（值的内容是组件的packageid数组），不取子表的，比如直接 this.$root.propData.compositeAttr["attrKey"]（注意attrKey是属性中定义的bindKey）,这里的格式为：['1','2']"",
     *  className:"指定的组件类型，比如只给待办组件发送，然后再去过滤上面的值"
     *  globalSend:如果为true则全站发送消息，注意全站rangeModule是无效的，只有className才有效，默认为false
     * } object 
     */
    sendBroadcastMessage(object){
        window.IDM.broadcast&&window.IDM.broadcast.send(object);
    },
    /**
     * 交互功能：设置组件的上下文内容值
     * @param {
     *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）、"
     *  key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
     *  data:"数据集，内容为：字符串 or 数组 or 对象"
     * }
     */
    setContextValue(object) {
      console.log("统一接口设置的值", object);
    }
  }
}
</script>
<style lang="scss" scoped>
.ITabVertical_app{
  position: relative;
  .ITabVertical_app_header{
    height: 44px;
    line-height: 44px;
    padding: 0 20px;
    font-family: MicrosoftYaHei-Bold;
    font-size: 24px;
    font-weight: 600;
    color: #FFFFFF;
    letter-spacing: 4px;
    background: #54C09C;
  }
  .ITabVertical_app_main{
    height: 140px;
    position: relative;
    &>img{
      height: 93px;
      left: 0;
      top: 27px;
      bottom: 20px;
      position: absolute;
    }
    .ITabVertical_app_main_body{
      height: 100%;
      text-align: center;
      .title{
        position: relative;
        font-family: MicrosoftYaHei-Bold;
        font-size: 18px;
        color: #333333;
        letter-spacing: 0;
        .svg-icon{
          position: absolute;
          left: -27px;
          top: 4px;
          color: #FF9900;
        }
      }
      .row{
        // width: 82px;
        text-align: left;
        &:nth-child(2){
          font-family: MicrosoftYaHei;
          font-size: 14px;
          color: #999999;
          letter-spacing: 0;
          span{
            &:nth-child(1){
              margin-right: 15px;
            }
          }
        }
      }
    }
  }
  .ITabVertical_app_footer{
    height: 60px;
    padding: 0 20px;
    background: #54C09C;
    .svg-icon{
      color: white;
    }
    &>.left{
      .svg-icon{
        margin-left: 26px;
        font-size: 20px;
        cursor: pointer;
        &:nth-child(1){
          margin-left: 0;
        }
      }
    }
    &>.center{
      height: 100%;
      margin: 0 27px 0 27px;
      padding: 0 20px;
      flex-grow: 2;
      border-left: 1px solid rgba(255,255,255,0.2);
      border-right: 1px solid rgba(255,255,255,0.2);
      .ant-slider{
        width: 100%;
        margin: 0;
      }
      .time{
        font-family: MicrosoftYaHei;
        font-size: 14px;
        color: #FFFFFF;
        letter-spacing: 0;
      }
      .currentTime{
        margin-right: 15px;
      }
      .duration{
        margin-left: 8px;
      }
    }
    &>.right{
      position: relative;
      .svg-icon{
        font-size: 20px;
        cursor: pointer;
      }
      .slider_block{
        height: 100px;
        position: absolute;
        bottom: 34px;
        left: calc(50% - 6px);
        .ant-slider{
          margin: 0;
        }
      }
    }
  }
  .audio_block{
    width: 5px;
    height: 5px;
    position: absolute;
    visibility: hidden;
  }
}
</style>
<style lang="scss">
.ITabVertical_app{
  .ITabVertical_app_footer{
    .center{
      .ant-slider{
        .ant-slider-track{
          background-color: #FF9900;
        }
        .ant-slider-handle{
          border: 1px solid white;
          &:focus{
            box-shadow: none;
          }
        }
        .ant-slider-rail{
          background-color: rgba(255,255,255,0.5);
        }
      }
    }
    .right{
      .ant-slider{
        .ant-slider-track{
          background-color: #FF9900;
        }
        .ant-slider-handle{
          border: 1px solid white;
          &:focus{
            box-shadow: none;
          }
        }
      }
    }
  }
}
</style>

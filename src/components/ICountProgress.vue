<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="ICountBar_app">
    <div v-if="propData.showHeader" class="header">
      <img src="../assets/head.png" alt="">
      <div class="header_right flex_center">

        <a-popover v-model="action_visible" @visibleChange="userLogoPopVisibleChange" :placement="propData.userLogoPopPlacement" overlayClassName="user_block_popover" :trigger="propData.showPersonActionEvent" >
          <div slot="content">
            <div @click="takePersonAction(item,index)" v-for="(item,index) in propData.personActionList" :key="index" class="user_dropdown_list flex_start">
              <svg class="idm_button_svg_icon" :style="getTopBarStyleInlineIcon(item)" v-if="item.iconSvg && item.iconSvg.length > 0" aria-hidden="true" > 
                  <use :xlink:href="`#${item.iconSvg[0]}`"></use>
              </svg>
              <span :style="getTopBarStyleInlineText(item)">{{ item.buttonText }}</span>
            </div>
          </div>
          <div class="flex_center">
            <span>{{ this.propData.welcomText }}{{ user_info.username ? user_info.username : '申龙'}}</span>
            <SvgIcon v-if="!is_user_logo_pop_show" icon-class="xialajiantou"></SvgIcon>
            <SvgIcon v-else icon-class="shangjiantou"></SvgIcon>
          </div>
          
        </a-popover>


        
      </div>
    </div>
    <div class="progress">
      <div class="title flex_center">
        <div class="title_left">
          年度归档情况
        </div>
        <div class="title_right ">
          <a-popover v-model="year_visible" @visibleChange="selectYearPopVisibleChange" overlayClassName="user_block_popover" :trigger="propData.showPersonActionEvent" >
            <div slot="content">
              <div v-for="(item,index) in years_arr" @click="selectYear(item)" :key="index" class="user_dropdown_list flex_start">
                <span>{{ item }}</span>
              </div>
            </div>
            <div class="flex_start">
              <span>{{ year }}年</span>
              <SvgIcon v-if="!is_select_year_pop_show" icon-class="xialajiantou"></SvgIcon>
              <SvgIcon v-else icon-class="shangjiantou"></SvgIcon>
            </div>
          </a-popover>
        </div>
      </div>
      <div class="progress_main">
        <div class="progress_left progress_main_label flex_end">
          <div class="main flex_center">
            <div class="label flex_column_center">
              <div class="number">{{ initData.noInFile }}</div>
              <div class="text">未归档数量</div>
            </div>
            <div class="circle_block flex_center">
              <div class="circle"></div>
              <div class="img_box flex_center">
                <img src="../assets/icon01.png" alt="">
              </div>
            </div>
          </div>
          <div class="line"></div>
          <div class="circle"></div>
        </div>
        <div class="progress_center flex_center">
          <div class="circle_bg circle_bg1">

          </div>
          <div class="circle_bg circle_bg2">

          </div>
          <div class="circle_bg circle_bg3">

          </div>
          <div class="progress_dom_label flex_column_center">
            <div class="number">{{ initData.percent }}%</div>
            <div class="text">归档进度</div>
          </div>
          <div id="progress_dom" class="progress_dom flex_center">
            <a-progress type="circle" :width="progressWidth" :stroke-color="{ '0%': '#73FAF6', '100%': '#097AFF', }" :percent="initData.percent" />
          </div>
        </div>
        <div class="progress_right progress_main_label flex_start">
          <div class="circle"></div>
          <div class="line"></div>
          <div class="main flex_center">
            <div class="circle_block flex_center">
              <div class="circle"></div>
              <div class="img_box flex_center">
                <img src="../assets/icon02.png" alt="">
              </div>
            </div>
            <div class="label flex_column_center">
              <div class="number">{{ initData.inFile }}</div>
              <div class="text">已归档数量</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="button_block flex_center">
      <div @click="takeFile()" class="button_list">
        开始档案整理
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from '../icons/SvgIcon.vue';
import { getProgressData } from '../mock/index'
import commonMixins from '../mixins/index'
export default {
  name: 'ICountProgress',
  components: {
    SvgIcon
  },
  mixins: [commonMixins],
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        personActionList: [
          {
            buttonText: '切换主题'
          },
          {
            buttonText: '退出登录'
          }
        ],
        showPersonActionEvent: 'click'
      },
      action_visible: false,
      is_user_logo_pop_show: false,
      year_visible: false,
      is_select_year_pop_show: false,
      years_arr: [],
      year: 2023,
      progressWidth: 0,
      initData: {
        noInFile: 0,
        inFile: 0,
        percent: 0
      },
      user_info: {}
    }
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
    this.getYearList()
    this.getInitData()
  },
  mounted() {
    this.getProgressHeight()
    window.onresize = () => {
      this.getProgressHeight()
    };
  },
  destroyed() {},
  methods:{
    getUserInfo() {
        let user_info = IDM.user.getCurrentUserInfo()
        console.log('ITopBar获取用户信息',user_info)
        this.user_info = user_info || {};
        this.getUserNameCustom()
    },
    getUserNameCustom() {
      if( this.propData.customFunctionUserName && this.propData.customFunctionUserName.length > 0 ){
          var resValue = "";
          var params = this.commonParam();
          let that = this;
          try {
              resValue = window[this.propData.customFunctionUserName[0].name]&&
                  window[this.propData.customFunctionUserName[0].name].call(this,{
                      ...params,
                      ...this.propData.customFunctionUserName[0].param,
                      moduleObject:this.moduleObject,
                      _this: this
                  });
              if ( resValue ) {
                  that.$set(that.user_info,'username',resValue)
              }
          } catch (error) {

          }
      }
    },
    takePersonAction(item,index) {
        this.action_visible = false;
        if(this.moduleObject.env=="develop"){
            return;
        }
        if ( item.buttonHandleType == 'none' ) {

        } else if ( item.buttonHandleType == 'changeTheme' ) {
            this.changeTheme(item)
        } else if ( item.buttonHandleType == 'changePassword' ) {
            this.changePassword(item)
        } else if ( item.buttonHandleType == 'logout' ) {
            this.logout(item)
        } else if ( item.buttonHandleType == 'custom' ) {
            this.takePersonActionCustom(item)
        }
    },
    changeTheme(item) {
        this.iframe_url_theme = IDM.url.getWebPath(this.propData.changeThemeIframeUrl) + (this.propData.changeThemeIframeUrl.indexOf('?')>-1?'&':'?') + 'skin=' + this.user_info.skin
        this.is_theme_dialog_show = true;
    },
    changePassword(item) {
        this.iframe_url_password = IDM.url.getWebPath(this.propData.changePasswordIframeUrl);
        this.is_password_dialog_show = true;
    },
    logout() {
      let that = this;
      this.$confirm({
        title: '提示?',
        content: h => <div style="color:red;">是否注销</div>,
        cancelText: '取消',
        okText: '确认',
        onOk() {
          console.log('OK');
          window.localStorage.setItem("showTip", "");
          window.localStorage.themeSkin = "";
          that.logoutSubmit()
        },
        onCancel() {
          console.log('Cancel');
        },
        class: 'test',
      });
    },
    logoutSubmit() {
        var logoutUrl = this.propData.logoutUrl;
        logoutUrl = logoutUrl + (logoutUrl.indexOf("?")>-1?"&":"?");
        logoutUrl = logoutUrl + "loginFrom=" + this.user_info.applicationUrl;
        window.location.href = IDM.url.getWebPath(logoutUrl);
    },
    takePersonActionCustom(item) {
        let that = this;
        if (this.moduleObject.env == "develop") {
            return;
        }
        let urlObject = window.IDM.url.queryObject();
        let pageId = window.IDM.broadcast && window.IDM.broadcast.pageModule ? window.IDM.broadcast.pageModule.id : "";
        
        var clickFunction = item.buttonCustomFunction;
        clickFunction && clickFunction.forEach(item1 => {
            window[item1.name] && window[item1.name].call(this, {
                urlData: urlObject,
                pageId,
                customParam: item1.param,
                _this: this
            });
        })
    },
    takeFile() {
      this.handleInvokeFunctions(this.propData.clickFunction, {
        
      })
    },
    getInitData() {
      if ( this.propData.dataSource && this.propData.dataSource.length ) {
        let that = this;
        var params = this.commonParam();
        params = this.makeParamsData(params)
        IDM.datasource.request(this.propData.dataSource[0].id,{
            moduleObject:this.moduleObject,
            _this: that,
            param:{
                ...params
            }
        },function(res){
            console.log('grid组件获取数据++++++++',res)
            that.initData = res
        },function(error){
          console.log('error',error)
        })
      } else {
        this.initData = getProgressData()
      }
    },
     makeParamsData(data) {
        let result = {};
        if ( this.propData.paramsMakeFunction && this.propData.paramsMakeFunction.length && window[this.propData.paramsMakeFunction[0].name] ) {
            result = window[this.propData.paramsMakeFunction[0].name].call(this, {
                                    ...data,
                                    ...this.propData.paramsMakeFunction[0].param,
                                    moduleObject: this.moduleObject,
                                    _this:this
                                });
            console.log('自定义参数函数',result)
            return result
        }
        return data
    },
    selectYear(item) {
      this.year = item;
      this.year_visible = false;
      this.is_select_year_pop_show = false;
    },
    getYearList() {
      for(let i = 2000;i < 2500;i++) {
        this.years_arr.push(i)
      }
    },
    getProgressHeight() {
      var element = document.getElementById("progress_dom");
      if ( element ) {
        var height = element.clientHeight;
        this.progressWidth = parseInt(height * 1); 
      }
    },
    getTopBarStyleInlineText(item) {
      let styleObject = {};
      for (const key in item) {
          if (this.propData.hasOwnProperty.call(item, key)) {
              const element = item[key];
              if (!element && element !== false && element != 0) {
                  continue;
              }
              switch (key) {
                  case "font":
                      IDM.style.setFontStyle(styleObject,element)
                      break;
              }
          }
      }
      return styleObject;
    },
    selectYearPopVisibleChange(e) {
      this.is_select_year_pop_show = e;
    },
    userLogoPopVisibleChange(e) {
      this.is_user_logo_pop_show = e;
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
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
.ICountBar_app{
  height: 100vh;
  // background-image: url(../assets/body-bg.png);
  // background-size: 100% 100%;
  @keyframes myfirst1 {
    0%   {
      transform: rotate(0deg);
    }
    25%  {
      transform: rotate(-90deg);
    }
    50%  {
      transform: rotate(-180deg);
    }
    100% {
      transform: rotate(-360deg);
    }
  }
  @keyframes myfirst3 {
    0%   {
      transform: rotate(0deg);
    }
    25%  {
      transform: rotate(90deg);
    }
    50%  {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .header{
    height: 10vh;
    margin-bottom: 3vh;
    position: relative;
    text-align: center;
    img{
      max-height: 100%;
    }
    .header_right{
      position: absolute;
      right: 58px;
      top: 21px;
      width: 255px;
      height: 50px;
      line-height: 50px;
      float: right;
      font-size: 18px;
      color: #00FFF4;
      letter-spacing: 0;
      background-image: url(../assets/user-bg.png);
      background-size: 100% 100%;
      .svg-icon{
        margin-left: 5px;
        font-size: 13px;
      }
    }
  }
  .progress{
    margin-bottom: 4.5vh;
    .title{
      margin-bottom: 3vh;
      .title_left{
        margin-right: 40px;
        font-size: 24px;
        color: #FFFFFF;
        letter-spacing: 0;
        line-height: 24px;
      }
      .title_right{
        font-size: 20px;
        color: #09E2F8;
        text-align: right;
        line-height: 24px;
        cursor: pointer;
        .svg-icon{
          margin-left: 5px;
          font-size: 14px;
        }
      }
    }
    .progress_main{
      position: relative;
      .progress_center{
        width: 58vh;
        height: 58vh;
        margin: 0 auto;
        position: relative;
        // background-image: url(../assets/yuan-bg.png);
        background-size: 100% 100%;
        .progress_dom{
          width: 69%;
          height: 69%;
        }
        .circle_bg1{
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          bottom: 0;
          z-index: 1;
          background-image: url(../assets/yuan-1.png);
          background-size: 100% 100%;
          animation:myfirst1 10s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        .circle_bg2{
          position: absolute;
          left: 3vh;
          right: 3vh;
          top: 3vh;
          bottom: 3vh;
          z-index: 2;
          background-image: url(../assets/yuan-2.png);
          background-size: 100% 100%;
        }
        .circle_bg3{
          position: absolute;
          left: 4.9vh;
          right: 4.9vh;
          top: 4.9vh;
          bottom: 4.9vh;
          z-index: 3;
          background-image: url(../assets/yuan-3.png);
          background-size: 100% 100%;
          animation:myfirst3 10s;
          animation-iteration-count: infinite;
          animation-timing-function: linear;
        }
        .progress_dom_label{
          position: absolute;
          width: 120px;
          height: 100px;
          left: 50%;
          top: 50%;
          z-index: 5;
          transform: translate(-50%, -50%);
          text-align: center;
          .number{
            font-family: DIN-Bold;
            font-size: 4.4vh;
            color: #FFFFFF;
            letter-spacing: 0;
          }
          .text{
            font-family: MicrosoftYaHei-Bold;
            font-size: 1.8vh;
            color: #FFFFFF;
            letter-spacing: 0;
          }
        }
        
      }
      .progress_main_label{
        position: absolute;
        &>.main{
          width: 16.5vw;
          height: 18.5vh;
          background-size: 100% 100%;
          .label{
            .number{
              width: 100%;
              font-size: 3.7vh;
              color: #00FFF4;
            }
            .text{
              width: 100%;
              font-family: MicrosoftYaHei;
              font-size: 1.85vh;
              color: #FFFFFF;
              letter-spacing: 0;
              text-align: right;
              line-height: 2.22vh;
            }
          }
          .circle_block{
            width: 11.2vh;
            height: 11.2vh;
            position: relative;
            .circle{
              position: absolute;
              left: 3px;
              right: 3px;
              top: 3px;
              bottom: 3px;
              background-image: url(../assets/icon-huan.png);
              background-size: 100% 100%;
              animation:myfirst3 10s;
              animation-iteration-count: infinite;
              animation-timing-function: linear;
            }
            .img_box{
              width: 40%;
              img{
                width: 100%;
              }
            }
          }
        }
        &>.line{
          width: 4.3vw;
          height: 1px;
          background: #3D7FFF;
        }
        &>.circle{
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #FFBE44 ;
        }
      }
      .progress_left{
        right: 50%;
        top: 50%;
        transform: translate(-24.8vh, -50%);
        z-index: 6;
        &>.main{
          background-image: url(../assets/left-box.png);
          .label{
            text-align: right;
          }
          .circle_block{
            left: 26px;
          }
        }
        
      }
      .progress_right{
        left: 50%;
        top: 50%;
        transform: translate(24.6vh, -50%);
        z-index: 6;
        &>.main{
          background-image: url(../assets/right-box.png);
          .label{
            text-align: left;
          }
          .circle_block{
            right: 26px;
          }
        }
      }
    }
    
  }
  
  .button_block{
    .button_list{
      width: 281px;
      height: 101px;
      line-height: 101px;
      font-size: 22px;
      color: #FFFFFF;
      letter-spacing: 4.4px;
      text-align: center;
      cursor: pointer;
      background-size: 100% 100%;
      &:nth-child(1){
        background-image: url(../assets/btn-bg1.png);
      }
    }
  }
}
</style>
<style lang="scss">
@import '../styles/counter.scss';
.user_block_popover{
  // padding: 10px 0 !important;
  // background-color: #fff;
  // background-clip: padding-box;
  // border-radius: 4px;
  // box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  
  .user_dropdown_list{
      padding: 4px 0px;
      font-size: 15px;
      color: #333;
      font-weight: 600;
      cursor: pointer;
      &:hover{
          color: #777;
      }
      .anticon{
          margin-right: 7px;
          font-size: 14px;
      }
      span{
          white-space: nowrap;
      }
      .idm_button_svg_icon{
          margin-right: 5px;
          font-size: 14px;
          width: 14px;
          height: 14px;
          fill: currentColor;
          vertical-align: -0.15em;
          outline: none;
          flex-shrink: 0;
      }
  }
  .ant-popover-inner-content{
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
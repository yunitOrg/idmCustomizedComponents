<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="ICountBar_app">
    <div class="echarts">
      <div class="echarts_body">
        <div class="title">
          {{ this.propData.echartsTitle }}
        </div>
        <div class="echarts_main">
          <div id="myBarChart" class="myBarChart"></div>
        </div>
        <div class="line_left line">
          <img :src="getImageSrc('','line-left')" alt="">
        </div>
        <div class="line_right line">
          <img :src="getImageSrc('','line-right')" alt="">
        </div>
      </div>
      
    </div>
    <div class="number_counter">
      <div v-if="propData.numberTitle" class="title">
        {{ propData.numberTitle }}
      </div>
      <div class="main flex_center">
        <div ref="dataStatistics" class="dataStatistics">
          <div v-for="(item,index) in number" :key="index" class="digit_set"></div>
          <div class="unit">件</div>
        </div>
      </div>
    </div>
    <div class="button_block flex_center">
      <div @click="takeFile()" class="button_list">
        档案归档
      </div>
      <div @click="takeSearch()" class="button_list">
        查询利用
      </div>
    </div>
    
  </div>
</template>

<script>
import counterBar from '../mixins/counterBar'
import * as echarts from 'echarts'
import { getEchartsData } from '../mock/index'

import '../mixins/jquery.dataStatistics'
import commonMixins from '../mixins/index'

export default {
  name: 'ICountBar',
  mixins: [ counterBar,commonMixins ],
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        showHeader: true,
        personActionList: [
          {
            buttonText: '切换主题'
          },
          {
            buttonText: '退出登录',
            buttonHandleType: 'logout'
          }
        ],
        numberCount: 8,
        during: 100,
        echartsType: 'pictorialBar',
        barWidth: '30'
      },
      action_visible: false,
      is_user_logo_pop_show: false,
      myChart: null,
      echarts_option: {},
      number: 6,
      user_info: { },
    }
  },
  watch: {
    
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    // console.log(this.moduleObject)
    this.number = this.propData.numberCount ? this.propData.numberCount : 6;
    this.convertAttrToStyleObject();
    this.setEchartsOption()
    this.getUserInfo()
  },
  mounted() {
    // 根据窗口大小调整图表大小
    window.onresize = () => {
      this.myChart && this.myChart.resize();
    };
    this.$nextTick(() => {
      this.initEcharts()
		})
  },
  destroyed() {},
  methods:{
    takeFile() {
      this.handleInvokeFunctions(this.propData.clickFunction1, {
        
      })
    },
    takeSearch() {
      this.handleInvokeFunctions(this.propData.clickFunction2, {
        
      })
    },
    getImageSrc(url,name) {
      if ( url ) {
        return IDM.url.getWebPath(url)
      } else {
        return IDM.url.getModuleAssetsWebPath(require(`../assets/${name}.png`),this.moduleObject)
      }
    },
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
    getBarOption() {

    },
    setEchartsOption() {
      this.echarts_option = {
        grid: {
            top: 50,
            left: 40,
            right: 0,
            bottom: 30
        },
        xAxis: {
          type: 'category',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: false,
          },
          minorSplitLine: {
            show: false
          },
          axisLabel: {
            margin: 12,
              textStyle: {
                  color: 'rgba(255,255,255,1)',
                  fontSize: '16px'
              }
          },
          data: [],
        },
        yAxis: {
          type: 'value',
          axisLabel: {
              textStyle: {
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '14px'
              }
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            show: true,
            lineStyle: {
              width: 1,
              color: 'rgba(255,255,255,0.2)',
            }
          }
        },
        // series: [
        //   {
        //     data: [],
        //     // type: this.propData.echartsType || 'bar',
        //     type: 'bar',
        //     animationDuration: this.propData.animationDuration,  // 这里设置动画持续时间为 3000 毫秒（3 秒）
        //     animationEasing: "cubicOut",  // 这里设置缓动函数为 cubicOut
        //     label: { 
        //         show: true,
        //         color: "#77C8FF",
        //         fontSize: "10",
        //         position: "top",
        //     },
        //     barBorderRadius:  [3, 3, 0, 0],
        //     barWidth: this.propData.barWidth,
        //     barMaxWidth: this.propData.barMaxWidth,
        //     // showBackground: true,
        //     itemStyle: {
        //       color: new echarts.graphic.LinearGradient(
        //         0, 0, 0, 1,       //4个参数用于配置渐变色的起止位置, 这4个参数依次对应右/下/左/上四个方位. 而0 0 0 1则代表渐变色从正上方开始
        //           [
        //               {offset: 1, color: '#07EDFF'},
        //               {offset: 0, color: '#0479FD'}
        //           ]                
        //       ),
        //       barBorderRadius: 2,
        //     }
        //   },
        //   {
        //     data: [],
        //     // 分隔
        //     type: "pictorialBar",
        //     tooltip: {
        //       show: false,
        //     },
        //     symbolRotate: "0",
        //     itemStyle: {
        //       color: '#3D7AFF'
        //     },
        //     symbolRepeat: "fixed",
        //     symbolMargin: 3,
        //     symbol: "rect",
        //     symbolClip: true,
        //     symbolSize: [this.propData.barWidth,3],
        //     symbolPosition: "start",
        //     symbolOffset: [0, 0],
        //     z: 66,
        //     animationEasing: "elasticOut",
        //     }
        // ],
        series: [
          {
            type: 'pictorialBar',
            symbol: 'rect',
            barWidth: this.propData.barWidth,
            label: { 
                show: true,
                color: "#77C8FF",
                fontSize: "10",
                position: "top",
            },
            itemStyle: {
                normal: {
                    color: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
                        {
                            offset: 0,
                            color: '#0479FD',

                        },
                        {
                            offset: 1,
                            color: '#07EDFF',

                        },
                    ]),
                }
            },
            data: []
          },
          {
                //辅助方格图形
                name: "辅助值",
                type: 'pictorialBar',
                barWidth: this.propData.barWidth,
                symbol: 'rect',
                symbolRepeat: 'true',
                symbolMargin: '70%',
                symbolSize: ['100%', '30%'],
                symbolOffset: ['0%', '0%'],
                itemStyle: {
                    normal: {
                        color: this.propData.gapColor ? this.propData.gapColor.hex8 : '#ffffff'
                    },
                },
                data : [],
                z: 2
            },
        ],
        animation: true,
      }
    },
    initEcharts() {
      let chartDom = document.getElementById("myBarChart");
			this.myChart = echarts.init(chartDom);
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
            that.makeEchartsData(res)
        },function(error){
          console.log('error',error)
        })
      } else {
        this.makeEchartsData(getEchartsData())
      }
    },
    makeEchartsData(result) {
      let { xlabel,data,total } = result;
      this.echarts_option.xAxis.data = xlabel;
      this.echarts_option.series[0].data = data;
      this.echarts_option.series[1].data = [];
      data.forEach((item) => {
        if (item - 20 > 0) {
          this.echarts_option.series[1].data.push(item - 20)
        } else {
          this.echarts_option.series[1].data.push(0)
        }
      })
      this.myChart.setOption(this.echarts_option);
      this.total = total;
      this.makeNumberCounter()
    },
    makeNumberCounter() {
      $('.dataStatistics').dataStatistics({min:0,max:this.total,time:this.propData.during,len:(this.propData.numberCount ? this.propData.numberCount : 6)});
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
    userLogoPopVisibleChange(e) {
      this.is_user_logo_pop_show = e;
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.number = this.propData.numberCount ? this.propData.numberCount : 6;
      this.convertAttrToStyleObject();
      this.initEcharts()
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
     * 重新加载
     */
    reload(){
      //请求数据源
      this.initData();
    },
    /**
     * 加载动态数据
     */
    initData(){
      let that = this;
      //所有地址的url参数转换
      var params = that.commonParam();
      switch (this.propData.dataSourceType) {
        case "customInterface":
          this.propData.customInterfaceUrl&&window.IDM.http.get(this.propData.customInterfaceUrl,params)
          .then((res) => {
            //res.data
            that.$set(that.propData,"fontContent",that.getExpressData("resultData",that.propData.dataFiled,res.data));
            // that.propData.fontContent = ;
          })
          .catch(function (error) {
            
          });
          break;
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
        case "customFunction":
          if(this.propData.customFunction&&this.propData.customFunction.length>0){
            var resValue = "";
            try {
              resValue = window[this.propData.customFunction[0].name]&&window[this.propData.customFunction[0].name].call(this,{...params,...this.propData.customFunction[0].param,moduleObject:this.moduleObject});
            } catch (error) {
            }
            that.propData.fontContent = resValue;
          }
          break;
      }
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
  // height: 100vh;
  // background-image: url(../assets/body-bg.png);
  // background-size: 100% 100%;
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
  .echarts{
    padding: 0 20%;
    height: 46vh;
    margin: 0 auto 5vh auto;
    .echarts_body{
      height: 100%;
      // margin: 50px;
      position: relative;
      padding: 11px 40px 40px 40px;
      background: rgba(14,95,255,0.15);
      border: 1px solid #3D7AFF;
      .title{
        // width: 748px;
        height: 50px;
        line-height: 50px;
        margin: 0 auto;
        font-size: 20px;
        color: #FFFFFF;
        letter-spacing: 0;
        text-align: center;
        background-image: url(../assets/echarts-title-bg.png);
        background-size: 100% 100%;
      }
      .echarts_main{
        height: calc(100% - 50px);
        #myBarChart{
          height: 100%;
        }
      }
      .line{
        width: 80px;
        position: absolute;
        height: 100%;
        top: 0;
        bottom: 0;
        img{
          height: 100%;
          width: 100%;
        }
      }
      .line_left{
        left: -43px;
      }
      .line_right{
        right: -38px;
      }
    }
  }
  .number_counter{
    width: auto;
    margin: 0 auto 4vh auto;
    .title{
      margin-bottom: 1vh;
      font-size: 24px;
      color: #FFFFFF;
      letter-spacing: 4.8px;
      text-align: center;
      line-height: 30px;
    }
  }
  .button_block{
    .button_list{
      width: 281px;
      height: 9vh;
      line-height: 9vh;
      font-size: 2.2vh;
      color: #FFFFFF;
      letter-spacing: 4.4px;
      text-align: center;
      cursor: pointer;
      background-size: 100% 100%;
      &:nth-child(1){
        margin-right: 60px;
        background-image: url(../assets/btn-bg1.png);
      }
      &:nth-child(2){
        background-image: url(../assets/btn-bg2.png);
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
}
</style>
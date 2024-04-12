<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="ITabVertical_app flex_between">
    <div class="ITabVertical_app_left">
      <div class="ITabVertical_app_left_main">
        <vue-scroll :ops="scrollOps">
          <div v-for="(item,index) in leftNavList" @click="changeCurrentColumn(item)" :key="index" class="list" :class="item.id == current_column ? 'list_active' : ''">
            {{ item.title }}
          </div>
        </vue-scroll>

      </div>
      <div @click="handleClickMore()" class="button_block">
        更多
      </div>
    </div>
    <div class="ITabVertical_app_right">
      <vue-scroll :ops="scrollOps">
        <div class="ITabVertical_app_right_main flex_start">
          <div v-for="(item,index) in rightDataList" @click="handleClickContent(item)" :key="index" class="list flex_between">
            <div class="list_left">
              <div class="top">{{ item.yearMonth }}</div>
              <div class="bottom">{{ item.day }}</div>
            </div>
            <div class="list_right">
              <div class="title">{{ item.title }}</div>
              <div class="content">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </vue-scroll>
    </div>
  </div>
</template>

<script>
import vuescroll from '../mixins/vueScroll'
import { getTabVerticalLeftList,getTabVerticalRightData } from '../mock/index'
export default {
  name: 'ITabVertical',
  mixins: [ vuescroll ],
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        
      },
      leftNavList: [],
      rightDataList: [],
      current_column: ''
    }
  },
  watch: {
    
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
    this.getLeftNavList()
  },
  mounted() {
    
  },
  destroyed() {},
  methods:{
    handleClickMore() {
      let itemObj = {};
      itemObj = this.leftNavList.filter((item) => {
        return item.columnId == this.current_column
      })
      IDM.invokeCustomFunctions.apply(this,[this.propData.clickMoreFunction,{
        columnId: this.current_column,
        item: itemObj ? itemObj : {}
      }])
    },
    handleClickContent(item) {
      IDM.invokeCustomFunctions.apply(this,[this.propData.clickContentFunction,{
        item: item
      }])
    },
    changeCurrentColumn(item) {
      this.current_column = item.id;
      this.getRightDataList()
    },
    getLeftNavList() {
      let that = this;
      if (this.propData.dataSourceLeft && this.propData.dataSourceLeft.length) {
        IDM.datasource.request(
          this.propData.dataSourceLeft[0].id,
          {
            moduleObject: this.moduleObject,
            navigationColumn: this.propData.selectColumn ? this.propData.selectColumn.id : ''
          }, function (res) {
            if (res && res.length) {
              that.leftNavList = res;
              that.getRightDataList()
            }
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      } else {
        this.leftNavList = getTabVerticalLeftList()
        this.current_column = this.leftNavList[0].id;
        this.getRightDataList()
      }
    },
    getRightDataList() {
      let that = this;
      if (this.propData.dataSourceRight && this.propData.dataSourceRight.length) {
        IDM.datasource.request(
          this.propData.dataSourceRight[0].id,
          {
            moduleObject: this.moduleObject,
            columnId: this.current_column,
            start: 1,
            limit: 6
          }, function (res) {
            if (res && res.length) {
              that.rightDataList = res;
            }
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      } else {
        this.rightDataList = getTabVerticalRightData()
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
.ITabVertical_app{
  // height: 468px;
  height: 500px;
  // padding: 16px 0;
  .ITabVertical_app_left{
    height: 100%;
    padding: 16px 0;
    text-align: center;
    .ITabVertical_app_left_main{
      height: calc(100% - 77px);
      width: 108px;
      padding: 27px 0;
      .list{
        height: 64px;
        line-height: 64px;
        margin-bottom: 33px;
        // padding: 16px 0;
        font-family: PingFangSC-Regular;
        font-size: 24px;
        color: #333333;
        text-align: center;
        // line-height: 24px;
        font-weight: 400;
        cursor: pointer;
        &:last-child{
          margin-bottom: 0;
        }
      }
      .list_active{
        color:  #0052A1;
        border-bottom: 2px solid rgba(0,82,161,1);
      }
    }
  }
  .ITabVertical_app_right{
    width: calc(100% - 220px);
    height: 100%;
    .ITabVertical_app_right_main{
      flex-wrap: wrap;
      padding: 16px 5px;
      .list{
        width: calc(50% - 30px);
        height: 139px;
        margin-top: 24px;
        padding: 24px 23px 24px 26px;
        background: rgba(255,255,255,0.97);
        box-shadow: 0px 2px 10px 0px rgba(0,0,0,0.1);
        border-radius: 4px;
        cursor: pointer;
        &:nth-child(1),&:nth-child(2){
          margin-top: 0;
        }
        &:nth-child(2n){
          margin-left: 60px;
        }
        .list_left{
          flex-shrink: 0;
          margin-right: 32px;
          text-align: center;
          .top{
            font-family: Helvetica-Bold;
            font-size: 22px;
            color: #333333;
            letter-spacing: 0;
            text-align: center;
            font-weight: 700;
          }
          .bottom{
            font-size: 16px;
            color: #999999;
            letter-spacing: 0;
            text-align: center;
            font-weight: 400;
          }
        }
        .list_right{
          width: calc(100% - 116px);
          flex-grow: 0;
          .title{
            width: 100%;
            margin-bottom: 12px;
            font-family: PingFangSC-Medium;
            font-size: 20px;
            color: #303031;
            letter-spacing: 0;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .content{
            height: 50px;
            overflow: hidden;
            font-family: PingFangSC-Regular;
            font-size: 18px;
            color: #666666;
            font-weight: 400;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }
    }
  }
}
</style>

<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IDraftStoreList_app">
    <div v-if="propData?.showTitle" class="IDraftStoreList_app_title">
      {{ propData.title }}
    </div>
    <div class="IDraftStoreList_app_main">
      <div v-if="propData.showSearch" class="search_block">
        <a-input v-model="searchValue" @change="handleSearch" placeholder="搜索文件类型" allowClear>
          <SvgIcon slot="prefix" icon-class="search" />
        </a-input>
      </div>
      <div class="list_block">
        <vue-scroll :ops="scrollOps">
          <div v-for="(item, index) in dataList" :key="index" class="type_block">
            <div v-if="propData?.showTypeTitle && item.typeNme" class="title">
              {{ item.typeNme }}
            </div>
            <div class="main" :class="`grid${propData.columnNumber}`">
              <div v-for="(item1, index1) in item.subList" :key="index1" class="list">
                <div class="text">
                  <span @click="handleClickItem(item1)">{{ item1.businessName }}</span>
                </div>
                <div v-if="propData.showStoreButton" class="icon_block" :class="item1.alreadyCollection == '1' ? 'icon_block_already' : ''">
                  <a-icon @click.stop="handleStoreCancel(item1)" v-if="item1.alreadyCollection == '1'" type="star" theme="filled" title="取消收藏" />
                  <a-icon @click.stop="handleStore(item1)" v-else type="star" title="收藏" />
                </div>
              </div>
            </div>
          </div>
        </vue-scroll>
      </div>
    </div>
  </div>
</template>

<script>
import vuescroll from '../mixins/vueScroll'
import SvgIcon from '../icons/SvgIcon.vue';
import { getDraftStoreData } from "@/mock/index.js"
export default {
  name: 'IDraftStoreList',
  mixins: [ vuescroll ],
  components: {
    SvgIcon
  },
  data(){
    return {
      moduleObject: this._moduleObject||{},
      propData: this._propData?.compositeAttr||this.$root?.propData?.compositeAttr || {
        loadDataCreated: true,
        showTitle: true,
        title: "收藏列表",
        showTypeTitle: true,
        showSearch: true,
        columnNumber: 3,
        showStoreButton: true
      },
      searchValue: '',
      dataList: [],
      resultData: {},
      conditionObject: {},
    }
  },
  watch: {
    
  },
  props: {
    _moduleObject: Object,
    _propData: Object
  },
  created() {
    this.moduleObject = this._moduleObject||this.$root.moduleObject;
    this.convertAttrToStyleObject();
    if(this.propData.loadDataCreated) {
      this.getInitData();
    }
  },
  mounted() {
    let that = this;
    this._moduleObject&&IDM.callBackComponentMountComplete?.apply(this,[this._moduleObject]);
  },
  destroyed() {
  },
  methods:{
    getInitData(isInit) {
      if(this.propData.dataSource?.length) {
        let that = this;
        let params = this.commonParam()
        //接收其他组件联动参数
        if ( this.propData.linkageParamList && this.propData.linkageParamList.length > 0 ) {
          this.propData.linkageParamList.forEach((lpitem) => {
            if (Object.keys(lpitem).length > 0) {
              if (lpitem.msgKey && this.conditionObject[lpitem.msgKey]) {
                if (lpitem.paramFun && lpitem.paramFun.length > 0) {
                  //有函数
                  try {
                    params[lpitem.paramKey || lpitem.msgKey] =
                      window[lpitem.paramFun[0].name] &&
                      window[lpitem.paramFun[0].name].call(this, {
                        ...params,
                        ...lpitem.paramFun[0].param,
                        moduleObject: this.moduleObject,
                        paramValue: this.conditionObject[lpitem.msgKey],
                      });
                  } catch (error) {
                    params[lpitem.paramKey || lpitem.msgKey] =
                      typeof this.conditionObject[lpitem.msgKey] == "object"
                        ? JSON.stringify(this.conditionObject[lpitem.msgKey])
                        : this.conditionObject[lpitem.msgKey];
                  }
                } else {
                  params[lpitem.paramKey || lpitem.msgKey] =
                    typeof this.conditionObject[lpitem.msgKey] == "object"
                      ? JSON.stringify(this.conditionObject[lpitem.msgKey])
                      : this.conditionObject[lpitem.msgKey];
                }
              }
            }
          });
        }
        IDM.datasource.request(
          this.propData.dataSource[0].id,
          {
            moduleObject: this.moduleObject,
            _this: this,
            ...params
          }, function (res) {
            if (res) {
              that.resultData = res;
              that.dataList = res;
            }
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      } else {
        this.dataList = getDraftStoreData()
      }
    },
    handleStore(item) {
      console.log(item)
      if(this.propData.storeCustomerFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [this.propData.storeCustomerFunction, {
          _this: this,
          item,
        }]);
      }
    },
    handleStoreCancel(item) {
      if(this.propData.unStoreCustomerFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [this.propData.unStoreCustomerFunction, {
          _this: this,
          item,
        }]);
      }
    },
    handleClickItem(item) {
      if(this.propData.itemClickCustomFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [this.propData.itemClickCustomFunction, {
          _this: this,
          item,
        }]);
      }
    },
    handleSearch(e) {
      console.log(e.target.value)
      if(this.propData.searchCustomFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [this.propData.searchCustomFunction, {
          _this: this,
          value: e.target.value
        }]);
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
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject(){
      this.convertAttrToStyleObjectTitle()
      this.convertAttrToStyleObjectSubTitle()
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
    convertAttrToStyleObjectTitle() {
      let styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "fontTitle":
              IDM.style.setFontStyle(styleObject,element)
              break;
            case "boxTitle":
              IDM.style.setBoxStyle(styleObject,element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .title',styleObject);
    },
    convertAttrToStyleObjectSubTitle() {
      let styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "fontSubTitle":
              IDM.style.setFontStyle(styleObject,element)
              break;
            case "boxSubTitle":
              IDM.style.setBoxStyle(styleObject,element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id + ' .describe',styleObject);
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
      if (object.type && object.type == "linkageDemand") {
        if (object.messageKey) {
          this.onReInitDataMsgKey(object.message, object.messageKey);
        }
      }
      // 配置了刷新KEY，消息类型是websocket，收到的消息对象有message并不为空
      if(this.propData.messageRefreshKey && this.propData.messageRefreshKey.length && object.type === 'websocket' && object.message){
        const messageData = typeof object.message === 'string' && JSON.parse(object.message) || object.message
        const arr = this.propData.messageRefreshKey || [];
        if(messageData.badgeType && arr.includes(messageData.badgeType)){
          this.getInitData(true)
        }
      }
    },
    onReInitDataMsgKey(conditionObject, messageKey) {
      this.conditionObject[messageKey] = conditionObject;
      this.getInitData(true);
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
.IDraftStoreList_app{
  height: 100vh;
  padding: 0 12px;
  display: flex;
  flex-direction: column;
  .IDraftStoreList_app_title{
    width: 100%;
    height: 60px;
    line-height: 60px;
    text-align: center;
    font-size: 22px;
    color: #333;
    font-weight: 600;
  }
  .IDraftStoreList_app_main{
    width: 100%;
    height: 0;
    flex-grow: 2;
    display: flex;
    flex-direction: column;
    padding: 0 0 20px 0;
    .search_block{
      width: 100%;
      margin-bottom: 10px;
    }
    .list_block{
      width: 100%;
      height: 0;
      flex-grow: 2;
      .type_block{
        margin-top: 30px;
        &:nth-child(1){
          margin-top: 0;
        }
        &>.title{
          margin-bottom: 10px;
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }
        &>.main{
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px 20px; /* 列间距 */
          &>.list{
            height: 46px;
            line-height: 46px;
            position: relative;
            padding: 0 50px 0 12px;
            font-size: 15px;
            font-weight: 500;
            color: #333;
            background: rgb(248, 249, 250);
            border: 1px solid rgb(233, 236, 239);
            border-radius: 8px;
            box-shadow: rgba(0, 0, 0, 0.04) 0px 1px 3px;
            &:hover{
              color: #fff;
              background: #0086D9;
            }
            .text{
              width: 100%;
              height: 100%;
              cursor: pointer;
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
            }
            .icon_block{
              position: absolute;
              right: 12px;
              top: 0;
              .anticon{
                cursor: pointer;
              }
            }
          }
        }
        &>.grid1{
          grid-template-columns: 1fr;
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        &>.grid2{
          grid-template-columns: 1fr 1fr;
          grid-template-columns: repeat(2, minmax(0, 1fr));
        }
        &>.grid3{
          grid-template-columns: 1fr 1fr 1fr;
          grid-template-columns: repeat(3, minmax(0, 1fr));
        }
        &>.grid4{
          grid-template-columns: 1fr 1fr 1fr 1fr;
          grid-template-columns: repeat(4, minmax(0, 1fr));
        }
        &>.grid5{
          grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
          grid-template-columns: repeat(5, minmax(0, 1fr));
        }
      }
    }
  }
}
</style>



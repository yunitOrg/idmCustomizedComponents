<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IOrganizationalStructure_app">
    <div v-for="(item,index) in dataList" :key="index" class="list">
      <div @click="handleClickHeader(item)" class="header flex_between">
        <div class="header_left flex_start">
          <img :src="getImageSrc('','zzjg')" alt="">
          <span class="name">{{ item.orgName }}</span>
        </div>
        <div class="header_right">
          <img :src="getImageSrc('',activeOrgId == item.fid ? 'top' : 'down')" alt="">
        </div>
      </div>
      <div v-if="activeOrgId?.indexOf(item.fid) != -1" class="main">
        <div class="list_block flex_start">
          <div @click="handleClickUser(item1)" v-for="(item1,index1) in item.children" :key="index1" class="list">
            {{ item1.name  }}
          </div>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script>
import { getIOrganizationalStructureDataListMock } from "@/mock/index.js"
export default {
  name: 'IOrganizationalStructure',
  data(){
    return {
      moduleObject:this._moduleObject||{},
      propData:this._propData?.compositeAttr||this.$root?.propData?.compositeAttr ||{
        accordion: false
      },
      activeOrgId: [],
      dataList: []
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
    this.getInitData()
  },
  mounted() {
    this._moduleObject&&IDM.callBackComponentMountComplete?.apply(this,[this._moduleObject]);
  },
  destroyed() {},
  methods:{
    handleClickUser(item) {
      IDM.invokeCustomFunctions.apply(this, [this.propData.customFunction, {
        item,
        _this: this
      }])
    },
    handleClickHeader(item) {
      if(this.propData.accordion) {
        this.activeOrgId = item.fid == this.activeOrgId?.[0] ? [] : [item.fid]
      } else {
        if(this.activeOrgId.indexOf(item.fid) == -1) {
          this.activeOrgId.push(item.fid)
        } else {
          this.activeOrgId.splice(this.activeOrgId.indexOf(item.fid),1)
        }
      }
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
          that.dataList = res
          if(that.propData.openFirst) {
            that.activeOrgId = [that.dataList[0].fid]
          }
        },function(error){
          console.log('error',error)
        })
      } else {
        this.dataList = getIOrganizationalStructureDataListMock()
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
    getImageSrc(url,name) {
      if ( url ) {
        return IDM.url.getWebPath(url)
      } else {
        return IDM.url.getModuleAssetsWebPath(require(`../assets/${name}.png`),this.moduleObject)
      }
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
    convertAttrToStyleObject() {
      this.codeStyleList = IDM?.setStyleObjectToPageHead ? [] : null
      var styleObject = {};
      if (this.propData.bgSize && this.propData.bgSize == "custom") {
        styleObject["background-size"] =
          (this.propData.bgSizeWidth
            ? this.propData.bgSizeWidth.inputVal +
              this.propData.bgSizeWidth.selectVal
            : "auto") +
          " " +
          (this.propData.bgSizeHeight
            ? this.propData.bgSizeHeight.inputVal +
              this.propData.bgSizeHeight.selectVal
            : "auto");
      } else if (this.propData.bgSize) {
        styleObject["background-size"] = this.propData.bgSize;
      }
      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject["background-position-x"] =
          this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject["background-position-y"] =
          this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }
      const keyList = [
        'width',
        'height',
        'bgColor',
        'bgImgUrl',
        'bgRepeat',
        'bgAttachment',
        'font',
        'box',
        'border',
        'boxShadow'
      ]
      for (const ikey in keyList) {
        const key = keyList[ikey]
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
              styleObject[key] = element;
              break;
            case "height":
              if (this.propData.HeightType == "adaptive" && this.moduleHeight) {
                styleObject[key] = this.moduleHeight + "px";
              } else {
                styleObject[key] = element;
              }
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case "boxShadow":
              styleObject["box-shadow"] = element;
              break;
            case "bgImgUrl":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移

              break;
            case "positionY":
              //背景纵向偏移

              break;
            case "bgRepeat":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "bgAttachment":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject, element);
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element);
              break;
          }
        }
      }
      let selector_keys = [
        {
          selector: '',
          style: styleObject
        }
      ]
      if(this.codeStyleList) {
        this.addDataToCodeStyle(selector_keys)
      } else {
        window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      }
      if(this.codeStyleList) {
        window.IDM.setStyleObjectToPageHead( this.moduleObject.packageid + "_IOrganizationalStructure", this.codeStyleList );
      }
    },
    addDataToCodeStyle(data) {
      let selector = '';
      data && data.length && data.forEach((item) => {
        if(item.isNoPrefix){
          selector = item.selector;
        } else {
          selector = '#' + this.moduleObject.id + (item.selector ? ` ${item.selector}` : '')
        }
        this.codeStyleList.push({
          selector: selector,
          style: item.style
        })
      })
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
      this.getInitData()
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
      // 配置了刷新KEY，消息类型是websocket，收到的消息对象有message并不为空
      if(this.propData.messageRefreshKey && this.propData.messageRefreshKey.length && object.type === 'websocket' && object.message){
        const messageData = typeof object.message === 'string' && JSON.parse(object.message) || object.message
        const arr = this.propData.messageRefreshKey || [];
        if(messageData.badgeType && arr.includes(messageData.badgeType)){
          this.reload()
        }
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
.IOrganizationalStructure_app{
  &>.list{
    margin-bottom: 16px;
    padding: 0 20px;
    background-image: linear-gradient(180deg, #FFFFFF 34%, #F9F2F2 100%);
    border: 1px solid rgba(248,195,201,1);
    &:last-child{
      margin-bottom: 0;
    }
    &>.header{
      height: 68px;
      .header_left{
        img{
          width: 38px;
          height: 38px;
          margin-right: 16px;
        }
        .name{
          font-family: PingFangSC-Medium;
          font-size: 20px;
          color: #333333;
          letter-spacing: 0;
          font-weight: 500;
        }
      }
    }
    &>.main{
      width: 100%;
      padding-top: 24px;
      padding-bottom: 10px;
      border-top: 1px solid #F9CDD2;
      .list_block{
        width: 100%;
        margin: 0 -50px 0 0;
        flex-wrap: wrap;
        &>.list{
          margin-right: 50px;
          padding-bottom: 14px;
          font-family: PingFangSC-Semibold;
          font-size: 18px;
          color: #BD1B2D;
          letter-spacing: 2px;
          text-align: center;
          font-weight: 600;
          white-space: nowrap;
          cursor: pointer;
        }
      }
      
    }
  }
}
</style>

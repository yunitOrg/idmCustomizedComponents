<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IMultiLevelTable_app">
    <div class="title" v-html="getTitleHtml()"></div>
    <div v-if="propData.showSubtitle" class="describe">
      <span class="text" v-html="getSubtitleHtml()"></span>
      <div v-if="propData.operateList?.length" class="operate_block flex_end">
        <template v-for="(item, index) in propData.operateList"> 
          <a-upload v-if="item.showType == 'upload'" :key="index"  name="file" :multiple="false" 
            :showUploadList="false" 
            :accept="item.acceptType" 
            :beforeUpload="() => false"
            @change="e => handleChangeFile(e, item)"
          >
            <a-button :type="item.type">{{ item.name }}</a-button>
          </a-upload>
          <a-button @click="handleClickButton(item)" v-else :key="index" :type="item.type">{{ item.name }}</a-button>
        </template>
        
      </div>
    </div>
    <div class="table">
      <a-table
        :id="tableId"
        :columns="tableColumns"
        :data-source="tableList"
        :pagination="propData?.showPagination ? paginationOptions : false"
        bordered
        :scroll="scrollOptions"
        :customRow="customRow"
      />
    </div>
  </div>
</template>

<script>
import { getMultiLevelTableHeaderList, getMultiLevelTableDataList } from "@/mock/index.js"
export default {
  name: 'IMultiLevelTable',
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        showSubtitle: true,
        showIndex: true,
        operateList: [
          {
            name: "导入",
            showType: 'upload',
            type: 'primary',
          }
        ],
        indexKey: 'key',
        mergeKey: 'A-1,evaluationType',
        getTitleCustomerFunction: [],
        getSubtitleCustomFunction: [],
      },
      tableColumns: [],
      tableList: [],
      pageNum: 1,
      pageSize: 10,
      paginationOptions: {
        current: this.pageNum,
        pageSize: this.pageSize,
        showQuickJumper: true,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '30', '40', '50'],
        showTotal: (total, range) => `共 ${total} 条记录`,
        onShowSizeChange: this.handleChangeSize,
        onChange: this.handleChangeTable
      },
      scrollOptions: {
        y: 0
      },
      tableId: IDM.UUID(),
      resultData: {},
      conditionObject: {},
    }
  },
  watch: {
    
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
    this.getInitData();
  },
  mounted() {
    let that = this;
    window.addEventListener('resize', this.makeTableScrollHeight)
    this.makeTableScrollHeight();
  },
  destroyed() {
    window.removeEventListener('resize', this.makeTableScrollHeight)
  },
  methods:{
    handleChangeFile(e, item) {
      console.log('e', e)
      if(item.handleChangeFileCustomerFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [item.handleChangeFileCustomerFunction, {
          _this: this,
          fileList: e.fileList,
          file: e.file
        }]);
      }
    },
    handleClickButton(item) {
      if(item.handleClickCustomerFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [item.handleClickCustomerFunction, {
          _this: this,
        }]);
      }
    },
    customRow(record, index) {
      let that = this;
      return { 
        props: {},
        on: {
          click: function (event) {
            that.rowClick(record, index, event)
          }
        }
      }
    },
    rowClick(record, index) {
      if(this.propData.rowClickCustomFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [this.propData.rowClickCustomFunction, {
          _this: this,
          record,
          index
        }]);
      }
    },
    getInitData(isInit) {
      if(isInit) {
        this.pageNum = 1;
      }
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
            pageNum: this.pageNum,
            pageSize: this.pageSize,
            params
          }, function (res) {
            if (res) {
              that.resultData = res;
              that.total = res.total;
              that.tableList = res.rows;
              that.makeTableHeaderData(res.columns)
            }
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      } else {
        let tableColumns = getMultiLevelTableHeaderList()
        this.makeTableHeaderData(tableColumns)
        this.tableList = getMultiLevelTableDataList()
      }
    },
    makeTableHeaderData(data = []) {
      let arr = JSON.parse(JSON.stringify(data))
      this.traverseTreeData(arr)
      if(this.propData.showIndex) {
        arr.unshift({
          title: '序号',
          dataIndex: this.propData.indexKey,
          key: this.propData.indexKey,
          width: 80,
          render: (text, record, index) => index + 1 + this.pageSize * (this.pageNum - 1)
        })

      }
      if(!this.propData.mergeKey) {
        this.tableColumns = arr;
        return 
      }
      this.loopMakeCustomRender(arr)
      this.tableColumns = arr
    },
    loopMakeCustomRender(arr) {
      arr.forEach(item => {
        if(item.children?.length) {
          this.loopMakeCustomRender(item.children)
        } else {
          if(this.propData.mergeKey.includes(item.key)) {
            item.customRender = (text, record, rowIndex) => {
              const obj = {
                children: text,
                attrs: {},
              };
              let rowSpan = 1;
              for (let i = rowIndex + 1; i < this.tableList.length; i++) {
                if (this.tableList[i][item.key] == record[item.key]) {
                  rowSpan++;
                } else {
                  break;
                }
              }
              for (let i = rowIndex - 1; i >= 0; i--) {
                if (this.tableList[i][item.key] == record[item.key]) {
                  obj.attrs.rowSpan = 0;
                  return obj;
                }
              }
              obj.attrs.rowSpan = rowSpan;
              return obj; 
            }
          }
        }
      })
    },
    // 遍历树状数据，赋值dateIndex
    traverseTreeData(data = []) {
      data.forEach(item => {
        if(item.children?.length) {
          item.key = undefined;
          this.traverseTreeData(item.children)
        } else {
          item.children = undefined;
        }
        if(item.key && (!item.children?.length) && !item.dataIndex) {
          item.dataIndex = item.key
        }
      })
    },
    getTitleHtml() {
      if(this.propData.getTitleCustomerFunction?.length) {
        const results = IDM.invokeCustomFunctions.apply(this, [this.propData.getTitleCustomerFunction, {
          _this: this
        }]);
        return results?.[0]
      } else {
        return `民主测评考核`
      }
    },
    getSubtitleHtml() {
      if(this.propData.getSubtitleCustomFunction?.length) {
        const results = IDM.invokeCustomFunctions.apply(this, [this.propData.getSubtitleCustomFunction, {
          _this: this
        }]);
        return results?.[0]
      } else {
        return `考核时间：`
      }
    },
    makeTableScrollHeight() {
      let that = this;
      let table = document.getElementById(that.tableId);
      if ( table ) {
        const thead = table.querySelector('.ant-table-thead');
        const headerHeight = thead.offsetHeight;
        let scrollHeight = `calc(100vh - ${table.getBoundingClientRect()?.top + headerHeight + (this.propData.showPagination ? 70 : 20)}px)`
        this.scrollOptions.y = scrollHeight;
      }
    },
    handleChangeSize(page, size) {
      console.log('分页参数-size',page,size)
      this.pageSize = size;
      this.getInitData(true)
    },
    handleChangeTable(page) {
      console.log('分页参数-page',page)
      this.pageNum = page;
      this.getInitData()
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
.IMultiLevelTable_app{
  height: 100vh;
  &>.title{
    font-weight: 700;
    font-size: 20px;
    color: #333333;
    text-align: center;
  }
  &>.describe{
    height: 38px;
    line-height: 38px;
    position: relative;
    text-align: center;
    .operate_block{
      position: absolute;
      right: 0;
      top: 0;
      .ant-btn{
        margin-left: 10px;
        &:nth-child(1){
          margin-left: 0;
        }
      }
    }
  }
}
</style>


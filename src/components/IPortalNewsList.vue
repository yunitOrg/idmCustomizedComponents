<template>
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    class="IPortalNewsList_app"
  >
    <template v-if="dataList.length > 0">
      <div class="IPortalNewsList_app_tabs">
        <span
          v-for="(item, index) in dataList"
          :key="'tab' + index"
          :class="{ active: activeTab == 'tab' + index }"
          @click="changeTab(index)"
          >{{ item.columnName }}</span
        >
        <template v-for="(item, index) in dataList">
          <div class="more" :key="'more' + index" :class="{ active: activeTab == 'tab' + index }" v-if="item.moreUrl" @click="openMore(item)">
            <a-tooltip>
              <template slot="title"> 更多 </template>
              <svg-icon iconClass="more2"></svg-icon>
              <!-- <img :src="getImageSrc('more2.svg')" alt="" /> -->
            </a-tooltip>
          </div>
        </template>
      </div>
      <div class="IPortalNewsList_app_main">
        <vue-scroll :ops="scrollOps">
          <template v-for="(column, index) in dataList">
            <div
              class="list_block"
              :key="'column' + index"
              v-if="activeTab == 'tab' + index"
            >
              <div v-for="item in column.records" :key="item.id" class="list_row" @click="handleClickItem(item)">
                <div class="text" :title="item.title">
                  <span>{{ item.title }}</span>
                </div>
                <!-- <div class="date">
                  <span>{{ item.displayDate }}</span>
                </div> -->
              </div>
            </div>
          </template>
        </vue-scroll>
      </div>
    </template>
    <template v-else>
      <div class="empty_block">
        <a-empty description="暂无数据" />
      </div>
    </template>
  </div>
</template>

<script>
import vuescroll from "../mixins/vueScroll";
import mockData from "@/mock/IPortalNewsList.js";
export default {
  name: "IPortalNewsList",
  mixins: [vuescroll],
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      dataList: [],
      resultData: {},
      conditionObject: {},
      activeTab: "tab0",
    };
  },
  watch: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
    this.getInitData();
  },
  mounted() {},
  destroyed() {},
  methods: {
    changeTab(index) {
      this.activeTab = "tab" + index;
    },
    openMore(item){
      console.log(item.moreUrl);
      window.open(item.moreUrl);
    },
    getInitData() {
      if (!this.moduleObject.env || this.moduleObject.env == "develop") {
        this.dataList = mockData.data || [];
      } else {
        let url = `ctrl/sfzyjzxcustom/jyhColumnData?orderBy=display_desc`;
        IDM.http
          .get(url)
          .done((res) => {
            console.log("数据", res);
            this.dataList = res.data || [];
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    handleClickItem(item) {
      let link = item.url;
      if(link){
        window.open(link);
      }
    },
    makeParamsData(data) {
      let result = {};
      if (
        this.propData.paramsMakeFunction &&
        this.propData.paramsMakeFunction.length &&
        window[this.propData.paramsMakeFunction[0].name]
      ) {
        result = window[this.propData.paramsMakeFunction[0].name].call(this, {
          ...data,
          ...this.propData.paramsMakeFunction[0].param,
          moduleObject: this.moduleObject,
          _this: this,
        });
        console.log("自定义参数函数", result);
        return result;
      }
      return data;
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      this.convertAttrToStyleObjectTitle();
      this.convertAttrToStyleObjectSubTitle();
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
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element);
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
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
    },
    convertAttrToStyleObjectTitle() {
      let styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "fontTitle":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "boxTitle":
              IDM.style.setBoxStyle(styleObject, element);
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .title",
        styleObject
      );
    },
    convertAttrToStyleObjectSubTitle() {
      let styleObject = {};
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "fontSubTitle":
              IDM.style.setFontStyle(styleObject, element);
              break;
            case "boxSubTitle":
              IDM.style.setBoxStyle(styleObject, element);
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(
        this.moduleObject.id + " .describe",
        styleObject
      );
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam() {
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
    getExpressData(dataName, dataFiled, resultData) {
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if (dataFiled) {
        var filedExp = dataFiled;
        filedExp = dataName + (filedExp.startsWiths("[") ? "" : ".") + filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      //对结果进行再次函数自定义
      if (
        this.propData.customFunction &&
        this.propData.customFunction.length > 0
      ) {
        var params = this.commonParam();
        var resValue = "";
        try {
          resValue =
            window[this.propData.customFunction[0].name] &&
            window[this.propData.customFunction[0].name].call(this, {
              ...params,
              ...this.propData.customFunction[0].param,
              moduleObject: this.moduleObject,
              expressData: _defaultVal,
              interfaceData: resultData,
            });
        } catch (error) {}
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
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object);
      if (object.type && object.type == "linkageDemand") {
        if (object.messageKey) {
          this.onReInitDataMsgKey(object.message, object.messageKey);
        }
      }
      // 配置了刷新KEY，消息类型是websocket，收到的消息对象有message并不为空
      if (
        this.propData.messageRefreshKey &&
        this.propData.messageRefreshKey.length &&
        object.type === "websocket" &&
        object.message
      ) {
        const messageData =
          (typeof object.message === "string" && JSON.parse(object.message)) ||
          object.message;
        const arr = this.propData.messageRefreshKey || [];
        if (messageData.badgeType && arr.includes(messageData.badgeType)) {
          this.getInitData(true);
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
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
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
    },
  },
};
</script>
<style lang="scss" scoped>
.IPortalNewsList_app {
  height: 100%!important;
  padding: 10px 0;
  font-size: 16px;
  display: flex;
  flex-direction: column;
  .IPortalNewsList_app_tabs {
    position: relative;
    display: flex;
    align-items: flex-end;
    margin: 0 20px -2px 20px;
    border-bottom: 1px solid #e8e8e8;
    span {
      padding-bottom: 10px;
      font-weight: 600;
      margin-right: 30px;
      font-size: 18px;
      color: #333;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      &.active {
        color: rgba(0, 115, 202, 1);
        border-bottom: 2px solid rgba(0, 115, 202, 1);
      }
    }
    .more {
      position: absolute;
      top: 0;
      right: 0;
      padding: 5px 15px;
      cursor: pointer;
      z-index: 2;
      display: none;
      &.active {
        display: block;
      }
      .svg-icon {
        outline: none;
      }
    }
  }
  .IPortalNewsList_app_main {
    width: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .list_block {
      width: 100%;
      flex: 1;
      padding: 8px 20px;
      overflow: hidden;
      .list_row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px dashed #ddd;
        line-height: 49px;
        cursor: pointer;
        .text {
          flex: 1;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .date {
          width: 160px;
          text-align: right;
        }
        &:hover {
          .text {
            text-decoration: underline;
          }
        }
      }
    }
  }

  .empty_block {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>



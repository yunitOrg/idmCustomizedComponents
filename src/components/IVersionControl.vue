<template>
  <!--
    根目录规范(必须不能为空)：
    idm-ctrl：控件类型 drag_container：容器，drag_container_inlieblock：行内容器，idm_module：非容器的组件
    id：使用moduleObject.id，如果id不使用这个将会被idm-ctrl-id属性替换
    idm-ctrl-id：组件的id，这个必须不能为空
  -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    class="idm-version-control-outer"
  >
    <div class="left-wrapper">
      <div class="header">
        <span>历史版本</span>
      </div>
      <div class="year-select">
        <span class="label">版本年限：</span>
        <a-select
          v-model="curYear"
          style="width: 100px"
          @change="handleYearChange"
        >
          <a-select-option v-for="item in yearList" :key="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>
      <div class="container" ref="container">
        <template v-if="recordList.length > 0">
          <div
            class="record-item"
            v-for="(item, index) in recordList"
            :key="index"
            :class="{'active': item.id == activeItem}"
          >
            <div class="record-item-inner">
              <div class="bar">
                <span>{{ item.content }}</span>
                <a-popover
                  overlayClassName="version-control-popover"
                  placement="right"
                  trigger="click"
                  :visible="item.visible"
                  @visibleChange="visibleChange(item)"
                >
                  <template slot="content">
                    <div @click="handleMoreClick(item, index)">查看详情</div>
                    <!-- <div @click="handleCopyClick(item)">复制</div> -->
                    <div @click="handleDeleteClick(item)">删除</div>
                  </template>
                  <div
                    class="more-btn"
                    @click.stop="() => (item.visible = !item.visible)"
                  ></div>
                </a-popover>
              </div>
              <div class="latest-tag" v-if="item.history == -1">最新</div>
            </div>
          </div>
        </template>
        <a-empty v-else description="暂无历史版本"></a-empty>
      </div>
    </div>
    <div class="right-wrapper">
      <iframe :src="iframeSrc" frameborder="0"></iframe>
    </div>
  </div>
</template>

<script>
import mockData from "../mock/IVersionControl.js";
export default {
  components: {},
  name: "IVersionControl",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      curYear: "",
      yearList: [],
      recordList: [],
      historyList: [
        {
          date: "2025-12-23",
          title: "修改决策会议及顺序",
          before: "总经会，党委会",
          after: "总经会，党委会，董事会",
        },
        {
          date: "2025-12-21",
          title: "修改事项名称",
          before:
            "500万元以上或者案情复杂、影响重大的法律诉讼（仲裁）、经济纠纷以及影响集团稳定的重大事件的处理意见。审法部定义“重大”范围，其他诉讼、仲裁由总经会决策。",
          after:
            "集团公司1000万元以上或者案情复杂、影响重大的法律诉讼（仲裁）、经济纠纷以及影响集团公司稳定的重大纠纷争议的处理方案或处理意见。",
        },
      ],
      iframeSrc: "",
      activeItem: "",
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.initDate();
    this.convertAttrToStyleObject();
  },
  mounted() {
    const container = this.$refs.container;
    container.addEventListener("scroll", (e) => {
      this.recordList.forEach((item) => {
        item.visible = false;
      });
    });
    document.addEventListener("click", (e) => {
      this.recordList.forEach((item) => {
        item.visible = false;
      });
    });
  },
  destroyed() {},
  methods: {
    handleCopyClick(item) {
      IDM.http
        .get("ctrl/szydLibrary/copyHistory", {
          ...IDM.url.queryObject(),
          pk: item.id,
        })
        .done((res) => {
          IDM.message.success("复制成功");
          this.initData();
        })
        .error((response) => {});
    },
    handleDeleteClick(item) {
      IDM.http
        .get("ctrl/szydLibrary/updateStatus", {
          ...IDM.url.queryObject(),
          pk: item.id,
          status: -1,
        })
        .done((res) => {
          IDM.message.success("删除成功");
          this.initData();
        })
        .error((response) => {});
    },
    visibleChange(item) {
      this.recordList.forEach((item) => {
        item.visible = false;
      });
      item.visible = !item.visible;
    },
    handleMoreClick(item, index) {
      this.activeItem = item.id;
      let url = "";
      if (item.history == -1) {
        url = `ctrl/formControl/form?listId=251210194415ThC6SfOKoEAymJ5MXqw&method=edit&moduleId=2512101723528VjuFYCwPrLSGmtLiHr&pk=${item.id}`;
      } else {
        url = `ctrl/formControl/form?listId=251210194415ThC6SfOKoEAymJ5MXqw&method=view&moduleId=260106163157OakPdIrnRyCe0gyArwJ&pk=${item.id}`;
      }
      this.iframeSrc = IDM.url.getContextWebUrl(url);
    },
    initDate() {
      this.yearList = [];
      for (let i = new Date().getFullYear(); i >= 2020; i--) {
        this.yearList.push({
          label: i + "年",
          value: i,
        });
      }
      this.curYear = this.yearList[0].value;
    },
    handleYearChange() {
      this.initData();
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
              if (element.marginTopVal) {
                styleObject["margin-top"] = `${element.marginTopVal}`;
              }
              if (element.marginRightVal) {
                styleObject["margin-right"] = `${element.marginRightVal}`;
              }
              if (element.marginBottomVal) {
                styleObject["margin-bottom"] = `${element.marginBottomVal}`;
              }
              if (element.marginLeftVal) {
                styleObject["margin-left"] = `${element.marginLeftVal}`;
              }
              if (element.paddingTopVal) {
                styleObject["padding-top"] = `${element.paddingTopVal}`;
              }
              if (element.paddingRightVal) {
                styleObject["padding-right"] = `${element.paddingRightVal}`;
              }
              if (element.paddingBottomVal) {
                styleObject["padding-bottom"] = `${element.paddingBottomVal}`;
              }
              if (element.paddingLeftVal) {
                styleObject["padding-left"] = `${element.paddingLeftVal}`;
              }
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
              if (element.border.top.width > 0) {
                styleObject["border-top-width"] =
                  element.border.top.width + element.border.top.widthUnit;
                styleObject["border-top-style"] = element.border.top.style;
                if (element.border.top.colors.hex8) {
                  styleObject["border-top-color"] =
                    element.border.top.colors.hex8;
                }
              }
              if (element.border.right.width > 0) {
                styleObject["border-right-width"] =
                  element.border.right.width + element.border.right.widthUnit;
                styleObject["border-right-style"] = element.border.right.style;
                if (element.border.right.colors.hex8) {
                  styleObject["border-right-color"] =
                    element.border.right.colors.hex8;
                }
              }
              if (element.border.bottom.width > 0) {
                styleObject["border-bottom-width"] =
                  element.border.bottom.width + element.border.bottom.widthUnit;
                styleObject["border-bottom-style"] =
                  element.border.bottom.style;
                if (element.border.bottom.colors.hex8) {
                  styleObject["border-bottom-color"] =
                    element.border.bottom.colors.hex8;
                }
              }
              if (element.border.left.width > 0) {
                styleObject["border-left-width"] =
                  element.border.left.width + element.border.left.widthUnit;
                styleObject["border-left-style"] = element.border.left.style;
                if (element.border.left.colors.hex8) {
                  styleObject["border-left-color"] =
                    element.border.left.colors.hex8;
                }
              }

              styleObject["border-top-left-radius"] =
                element.radius.leftTop.radius +
                element.radius.leftTop.radiusUnit;
              styleObject["border-top-right-radius"] =
                element.radius.rightTop.radius +
                element.radius.rightTop.radiusUnit;
              styleObject["border-bottom-left-radius"] =
                element.radius.leftBottom.radius +
                element.radius.leftBottom.radiusUnit;
              styleObject["border-bottom-right-radius"] =
                element.radius.rightBottom.radius +
                element.radius.rightBottom.radiusUnit;
              break;
            case "font":
              styleObject["font-family"] = element.fontFamily;
              if (element.fontColors.hex8) {
                styleObject["color"] = element.fontColors.hex8;
              }
              styleObject["font-weight"] =
                element.fontWeight && element.fontWeight.split(" ")[0];
              styleObject["font-style"] = element.fontStyle;
              styleObject["font-size"] =
                element.fontSize + element.fontSizeUnit;
              styleObject["line-height"] =
                element.fontLineHeight +
                (element.fontLineHeightUnit == "-"
                  ? ""
                  : element.fontLineHeightUnit);
              styleObject["text-align"] = element.fontTextAlign;
              styleObject["text-decoration"] = element.fontDecoration;
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
      this.initData();
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
     * 重新加载
     */
    reload() {
      //请求数据源
      this.initData();
    },
    /**
     * 加载动态数据
     */
    initData() {
      const pk = IDM.url.queryString("pk");
      if(!pk){
        this.iframeSrc = IDM.url.getContextWebUrl(
          `ctrl/formControl/form?listId=251210194415ThC6SfOKoEAymJ5MXqw&method=add&moduleId=2512101723528VjuFYCwPrLSGmtLiHr`,
        );
        return
      }
      // if (!this.moduleObject.env || this.moduleObject.env == "develop") {
      //   const res = mockData.data;
      //   console.log("表格数据", res);
      //   this.recordList = res.map((item) => ({
      //     ...item,
      //     visible: false,
      //   }));
      // } else {
      IDM.http
        .get("ctrl/szydLibrary/getHistory", {
          ...IDM.url.queryObject(),
          year: this.curYear,
        })
        .done((res) => {
          this.recordList = res.data.map((item) => ({
            ...item,
            visible: false,
          }));
          // const pk = IDM.queryString("pk");
          // if (pk) {
            // this.iframeSrc = IDM.url.getContextWebUrl(
            //   `ctrl/formControl/form?listId=251210194415ThC6SfOKoEAymJ5MXqw&method=edit&moduleId=2512101723528VjuFYCwPrLSGmtLiHr&pk=${.id}`,
            // );
          // } else {
          //   this.iframeSrc = IDM.url.getContextWebUrl(
          //     `ctrl/formControl/form?listId=251210194415ThC6SfOKoEAymJ5MXqw&method=add&moduleId=2512101723528VjuFYCwPrLSGmtLiHr`,
          //   );
          // }
          const item = this.recordList[0]
          this.activeItem = item.id;
          let url = "";
          if (item.history == -1) {
            url = `ctrl/formControl/form?listId=251210194415ThC6SfOKoEAymJ5MXqw&method=edit&moduleId=2512101723528VjuFYCwPrLSGmtLiHr&pk=${item.id}`;
          } else {
            url = `ctrl/formControl/form?listId=251210194415ThC6SfOKoEAymJ5MXqw&method=view&moduleId=260106163157OakPdIrnRyCe0gyArwJ&pk=${item.id}`;
          }
          this.iframeSrc = IDM.url.getContextWebUrl(url);

          
        })
        .error((response) => {});
      // }
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
          dataObject,
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
     * 文本点击事件
     */
    textClickHandle() {
      let that = this;
      if (this.moduleObject.env == "develop") {
        //开发模式下不执行此事件
        return;
      }
      //获取所有的URL参数、页面ID（pageId）、以及所有组件的返回值（用范围值去调用IDM提供的方法取出所有的组件值）
      let urlObject = window.IDM.url.queryObject(),
        pageId =
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "";
      //自定义函数
      /**
       * [
       * {name:"",param:{}}
       * ]
       */
      var clickFunction = this.propData.clickFunction;
      clickFunction &&
        clickFunction.forEach((item) => {
          window[item.name] &&
            window[item.name].call(this, {
              urlData: urlObject,
              pageId,
              customParam: item.param,
              _this: this,
            });
        });
    },
    showThisModuleHandle() {
      this.propData.defaultStatus = "default";
    },
    hideThisModuleHandle() {
      this.propData.defaultStatus = "hidden";
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
      if (object.type && object.type == "linkageShowModule") {
        this.showThisModuleHandle();
      } else if (object.type && object.type == "linkageHideModule") {
        this.hideThisModuleHandle();
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
      if (object.type != "pageCommonInterface") {
        return;
      }
      //这里使用的是子表，所以要循环匹配所有子表的属性然后再去设置修改默认值
      if (object.key == this.propData.dataName) {
        // this.propData.fontContent = this.getExpressData(this.propData.dataName,this.propData.dataFiled,object.data);
        this.$set(
          this.propData,
          "fontContent",
          this.getExpressData(
            this.propData.dataName,
            this.propData.dataFiled,
            object.data,
          ),
        );
      }
    },
  },
};
</script>
<style scoped lang="scss">
.idm-version-control-outer {
  height: 500px;
  display: flex;

  .left-wrapper {
    padding: 20px;
    width: 300px;
    background: #ffffff;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.12);
  }

  .right-wrapper {
    width: calc(100% - 320px);
    background: #ffffff;
    margin-left: 20px;
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.12);
    iframe {
      width: 100%;
      height: 100%;
    }
  }
  .header {
    position: relative;
    border-bottom: 1px solid rgba(0, 128, 255, 1);
    padding: 14px 0;
    padding-left: 14px;
    &::before {
      content: "";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      display: block;
      width: 4px;
      height: 20px;
      background: #0080ff;
    }
    span {
      font-family: MicrosoftYaHei-Bold;
      font-size: 18px;
      color: #333333;
      letter-spacing: 0;
      text-align: center;
      font-weight: 700;
    }
  }

  .year-select {
    padding: 16px 0;
    .label {
      font-family: MicrosoftYaHei;
      font-size: 16px;
      color: #333333;
      letter-spacing: 0;
      font-weight: 400;
    }

    ::v-deep .ant-select-selection {
      background: #efefef;
      border-radius: 4px;
      height: 34px;

      &:hover {
        border-color: #0080ff;
      }

      .ant-select-selection__rendered {
        line-height: 34px;
      }
    }
  }

  .container {
    padding-left: 20px;
    overflow: auto;
    height: calc(100% - 123px);

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f5f5;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdcdc;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #b3b3b3;
    }

    &::-webkit-scrollbar-thumb:active {
      background: #8c8c8c;
    }

    &::-webkit-scrollbar-corner {
      background: #f5f5f5;
    }

    .record-item {
      position: relative;
      border-left: 1px dashed #0080ff;
      padding-left: 18px;
      height: 75px;
      font-family: MicrosoftYaHei-Bold;
      font-size: 16px;
      color: #333333;
      letter-spacing: 0;
      font-weight: 700;
      cursor: pointer;
      &:last-child {
        height: 10px;
      }

      &::before {
        content: "";
        display: block;
        width: 12px;
        height: 12px;
        border: 1px solid #0080ff;
        position: absolute;
        top: 0;
        left: -6px;
        border-radius: 50%;
        background: #fff;
        z-index: 1;
      }

      &.active {
        &::before {
          background: #0080ff;
        }
      }

      .record-item-inner {
        position: absolute;
        margin-top: -5px;
        .latest-tag {
          background: #fef2e0;
          border-radius: 4px;
          font-family: MicrosoftYaHei;
          font-size: 12px;
          color: #ff9900;
          letter-spacing: 0;
          font-weight: 400;
          width: 46px;
          text-align: center;
        }
        .bar {
          display: flex;
          align-items: center;
          .more-btn {
            cursor: pointer;
            margin-left: 16px;
            transform: translateY(-1px);
            width: 24px;
            height: 12px;
            background: url(../assets/more.svg) no-repeat center center;
            background-size: 100% 100%;
          }
        }
      }
    }
  }
}
</style>
<style lang="scss">
.version-control-modal {
  .ant-modal-header {
    background-image: linear-gradient(180deg, #cfe5fa 0%, #f7fafe 100%);

    .ant-modal-title {
      font-family: MicrosoftYaHei-Bold;
      font-size: 20px;
      color: #333333;
      letter-spacing: 0;
      font-weight: 700;
    }
  }
  .ant-modal-close-x {
    font-size: 20px;
  }
  .history {
    height: 50vh;
    padding-left: 10px;
    overflow: auto;

    &::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f5f5f5;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #dcdcdc;
      border-radius: 4px;
      transition: background 0.2s ease;
    }

    &::-webkit-scrollbar-thumb:hover {
      background: #b3b3b3;
    }

    &::-webkit-scrollbar-thumb:active {
      background: #8c8c8c;
    }

    &::-webkit-scrollbar-corner {
      background: #f5f5f5;
    }

    .history-item {
      position: relative;
      border-left: 2px solid #e5e5e5;
      padding-left: 20px;
      padding-bottom: 14px;
      &:last-child {
        padding-bottom: 0;
      }

      &::before {
        content: "";
        display: block;
        width: 16px;
        height: 16px;
        border: 1px solid #0080ff;
        position: absolute;
        top: 0;
        left: -8px;
        border-radius: 50%;
        background: #0080ff;
        z-index: 1;
      }

      .history-item-inner {
        padding-bottom: 24px;
        transform: translateY(-5px);

        &:last-child {
          padding-bottom: 0;
        }

        .bar {
          font-family: MicrosoftYaHei-Bold;
          font-size: 16px;
          color: #333333;
          letter-spacing: 0;
          font-weight: 700;
          margin-bottom: 14px;

          span {
            &:last-child {
              margin-left: 16px;
            }
          }
        }

        .content {
          display: flex;
          background: #f8f8f8;
          border-radius: 8px;
          padding: 18px;

          font-family: MicrosoftYaHei;
          font-size: 14px;
          color: #666666;
          letter-spacing: 0;
          line-height: 22px;
          font-weight: 400;

          & > div {
            width: 50%;

            &:first-child {
              border-right: 1px solid #e5e5e5;
              padding-right: 18px;
            }
            &:last-child {
              padding-left: 18px;
            }
          }

          .label {
            font-family: MicrosoftYaHei-Bold;
            font-size: 14px;
            color: #333333;
            letter-spacing: 0;
            font-weight: 700;
            margin-bottom: 8px;
          }
        }
      }
    }
  }
}

.version-control-popover {
  .ant-popover-inner {
    border-radius: 10px;
  }
  .ant-popover-inner-content {
    padding: 0;
    padding: 8px 0;
    & > div {
      height: 26px;
      line-height: 26px;
      padding: 0 12px;
      font-family: MicrosoftYaHei;
      font-size: 12px;
      color: #666;
      letter-spacing: 0;
      font-weight: 400;
      cursor: pointer;
      &:hover {
        background: rgba(0, 128, 255, 0.1);
        color: #0080ff;
      }
    }
  }
}
</style>

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
    class="idm-erp-purchase-request-outer"
  >
    <div class="project-board">
      <div class="header"><span>项目看板</span></div>
      <div class="container">
        <div class="desc">
          <span style="font-size: 20px" @click="handleClickBoardName">{{boardData.name}}</span>
          <span style="font-size: 16px">验收时间：{{boardData.time}}</span>
        </div>
        <div class="board">
          <div
            class="board-item"
            v-for="(item, index) in boardData.list"
            :key="index"
            :style="`width:${item.items.length > 1 ? '330px' : '182px'};`"
          >
            <div class="items" v-for="(inner, i) in item.items" :key="i" @click="handleClickBoardItem(inner)">
              <div class="tit">{{ inner.title }}</div>
              <div class="value">
                {{ inner.value }}
                <template v-if="inner.percent">
                  /<span>{{ inner.percent }}</span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="situation">
      <div class="budget">
        <div class="header"><span>采购计划</span> <div class="tips">（红色为本次采购，蓝色为历史采购，白色为未采购）</div></div>
        <div class="container">
          <div class="content">
            <div class="top">
              <div class="left"><div class="field">采购报备总计：{{budgetData.budget}}w</div></div>
              <div class="right"><div class="field">外采种类：{{budgetData.list.length}}</div></div>
            </div>
            <div class="bottom">
              <div
                class="item"
                v-for="(item, index) in budgetData.list"
                :key="index"
                :class="{
                  active: item.status === '1',
                  done: item.status === '2',
                }"
                @click="handleClickItem(item)"
              >
                <div class="type">{{ item.typeText }}</div>
                <div class="detail">
                  <div class="description">
                    <div class="title">{{ item.title }}</div>
                    <div class="amount">
                      <span> {{ item.amount }}</span
                      >&nbsp;万元
                    </div>
                  </div>
                  <template v-if="item?.goodList?.length > 0">
                    <div
                      class="goods"
                      v-for="(good, i) in item.goodList"
                      :key="i"
                    >
                      <div class="name">{{ good.name }}</div>
                      <div class="total">{{ good.total }}</div>
                      <div class="amount">
                        <span>{{ good.amount }}</span
                        >万元
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="actual">
        <div class="header"><span>实际采购情况</span></div>
        <div class="container">
          <div class="content">
            <div class="top">
              <div class="left">
                <div class="field">本合同额：{{actualData.amount}}w({{actualData.amountPaid}}w已付)</div>
                <div class="field">本次申请支付：{{actualData.thisPayment}}w</div>
                <div class="field">付款比例：{{actualData.percent}}%</div>
                <div class="field">累计合同额：{{actualData.totalAmount}}w</div>
                <div class="field">已付：{{actualData.paid}}w</div>
              </div>
              <div class="right"><div class="field">已采种类：{{actualData.list.length}}</div></div>
            </div>
            <div class="bottom">
              <div
                class="item"
                v-for="(item, index) in actualData.list"
                :key="index"
                :class="{
                  active: item.status === '1',
                  done: item.status === '2',
                }"
                @click="handleClickItem(item)"
              >
                <div class="type">{{ item.typeText }}</div>
                <div class="detail">
                  <div class="description">
                    <div class="title">{{ item.title }}</div>
                    <div class="amount">
                      合同额： {{ item.amount }} 万元
                    </div>
                    <div class="amount" style="margin-left: 30px">已付： <span style="font-size: 22px;">{{ item.paid }}</span>&nbsp;万元</div>
                  </div>
                  <template v-if="item?.goodList?.length > 0">
                    <div
                      class="goods"
                      v-for="(good, i) in item.goodList"
                      :key="i"
                    >
                      <div class="name">{{ good.name }}</div>
                      <div class="total">{{ good.total }}</div>
                      <div class="amount">
                        <span>{{ good.amount }}</span
                        >万元
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "IErpPurchaseRequest",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      boardData:{
        name:"",
        time:"",
        url:"",
        list:[]
      },
      budgetData:{
        budget:"",
        list:[]
      },
      actualData:{
        amount:"",
        amountPaid:"",
        paid:"",
        percent:"",
        thisPayment:"",
        totalAmount:"",
        list:[]
      },
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
  },
  mounted() {},
  destroyed() {},
  methods: {
    handleClickBoardName(){
      this.boardData.url && window.open(this.boardData.url);
    },
    handleClickBoardItem(item){
      item.url && window.open(item.url);
    },
    handleClickItem(item){
      item.url && window.open(item.url);
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
      this.getBoardData();
      this.getBudgetData();
      this.getActualData();
    },
    getBoardData(){
      if(this.propData.boardDataSource && this.propData.boardDataSource.length){
        IDM.datasource.request(
          this.propData.boardDataSource[0].id,
          {
            moduleObject: this.moduleObject,
            _this: this,
            param: {
              ...IDM.url.queryObject()
            },
          },  (res) => {
            console.log(res,"boardList")
            this.boardData = res;
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      }
    },
    getBudgetData(){
      if(this.propData.budgetDataSource && this.propData.budgetDataSource.length){
        IDM.datasource.request(
          this.propData.budgetDataSource[0].id,
          {
            moduleObject: this.moduleObject,
            _this: this,
            param: {
              ...IDM.url.queryObject()
            },
          }, (res) => {
            console.log(res,"budgetList")
            this.budgetData = res;
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      }
    },
    getActualData(){
      if(this.propData.actualDataSource && this.propData.actualDataSource.length){
        IDM.datasource.request(
          this.propData.actualDataSource[0].id,
          {
            moduleObject: this.moduleObject,
            _this: this,
            param: {
              ...IDM.url.queryObject()
            },
          }, (res) => {
            console.log(res,"actualList")
            this.actualData = res;
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      }
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
            object.data
          )
        );
      }
    },
  },
};
</script>
<style scoped lang="scss">
.idm-erp-purchase-request-outer {
  width: 100%;
  height: 100%;
  padding: 20px;

  .header {
    font-size: 20px;
    color: #0086d9;
    font-weight: 500;
    border-bottom: 1px solid #0086d9;
    padding: 6px 0;
    display: flex;
    span {
      display: flex;
      align-items: center;

      &:before {
        content: "";
        display: inline-block;
        width: 3px;
        height: 100%;
        background-color: #0086d9;
        margin-right: 10px;
      }
    }

    .tips {
      display: flex;
      align-items: center;
      padding: 4px 6px;
      font-size: 16px;
      margin-left: 14px;
      border-radius: 5px;
    }
  }

  .container {
    padding: 10px;

    .desc {
      padding: 10px 20px;
      background: rgba(21, 119, 255, 0.05);
      border-radius: 4px;
      span {
        color: #000;
        margin-right: 30px;
      }
    }

    .board {
      display: flex;
      gap: 20px;
      margin-top: 10px;

      & > div {
        padding: 10px;
        background: rgba(21, 119, 255, 0.05);
        border: 1px solid rgba(21, 119, 255, 0.3);
        border-radius: 4px;
        display: flex;
        width: 182px;

        .title {
          font-size: 16px;
          color: #666;
        }
        .value {
          font-size: 24px;
          color: #333333;
          span {
            font-size: 16px;
            color: #333333;
          }
        }
      }
      .items {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        &:not(:first-child) {
          border-left: 1px solid rgba(21, 119, 255, 0.15);
        }
      }
    }
  }

  .project-board {
    padding-bottom: 20px;
  }

  .situation {
    display: flex;
    gap: 40px;

    & > div {
      flex: 1;
    }
    .content {
      border: 1px solid #e4e4e4;
      border-radius: 10px;
      padding: 0;

      .top {
        background: #f5f5f5;
        display: flex;
        justify-content: space-between;
        padding: 10px 20px;

        .left {
          display: flex;
          gap: 20px;
        }
      }

      .bottom {
        .item {
          display: flex;
          border-bottom: 1px solid #e4e4e4;
          align-items: flex-start;
          padding: 10px 20px;

          .type {
            background: #e7f1ff;
            border: 1px solid rgba(21, 119, 255, 0.3);
            border-radius: 4px;
            font-size: 12px;
            color: #1577ff;
            padding: 2px 6px;
            margin-top: 4px;
          }

          &.active {
            background: rgba(255, 21, 21, 0.05);
            .description {
              .title {
                color: #333;
              }
              .amount {
                color: #333;
                span {
                  color: #333;
                }
              }
            }
            .goods {
              color: #666;
            }
          }
          &.done {
            background: rgba(21, 119, 255, 0.05);
            .description {
              .title {
                color: #333;
              }
              .amount {
                color: #333;
                span {
                  color: #333;
                }
              }
            }
            .goods {
              color: #666;
            }
          }

          &:last-child {
            border-bottom: none;
          }

          .detail{
            padding: 0 10px;
            flex: 1;
          }

          .description {
            display: flex;
            justify-content: space-between;
            align-items: center;

            .title {
              flex: 1;
              color: #808080;
              font-size: 16px;
            }
            .amount {
              color: #808080;
              font-size: 16px;
              display: flex;
              align-items: center;
              span {
                font-size: 22px;
                color: #808080;
              }
            }
          }
          .goods {
            display: flex;
            color: #808080;
            padding: 2px 0;
            font-size: 14px;
            gap: 30px;
          }
        }
      }
    }

    .actual .container .content .top {
      .left {
        width: calc(100% - 100px);
        flex-wrap: wrap;
        gap: unset;
        .field {
          margin-right: 20px;

          &:last-child {
            margin-right: 0;
          }
        }
      }
      .right {
        width: 100px;
        text-align: right;
      }
    }
  }
}
</style>
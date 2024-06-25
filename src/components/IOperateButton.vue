<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IOperateButton_app" ref="module_ref">
    <div v-if="propData.title" class="title">
      {{ propData.title }}
    </div>
    <div class="IOperateButton_app_main flex_between">
      <div class="IOperateButton_app_left flex_column_center">
        <template v-if="propData.totalList && propData.totalList.length">
          <div @click="hanldeClickTotal(item)" v-for="(item,index) in propData.totalList" :key="index" class="list flex_between">
            <div class="list_left">
              <svg class="idm_button_svg_icon" aria-hidden="true">
                <use :xlink:href="`#${item.iconSvg}`"></use>
              </svg>
            </div>
            <div class="list_right">
              <div class="number">
                {{ initData[item.topNumberKey] }}
              </div>
              <div class="name">
                {{ item.name }}
              </div>
            </div>
          </div>
        </template>
      </div>
      <div class="IOperateButton_app_right flex_between">
        <template v-if="propData.gridList && propData.gridList.length">
          <div @click="hanldeClickButton(item)" v-for="(item,index) in propData.gridList" :key="index" class="button_list">
            {{ item.name }}
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import { getTurnoverRoomData } from "../mock/index";
export default {
  name: 'IOperateButton',
  components: {
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        title: '周转房管理',
        totalList: [
          {
            name: '我要查',
            topNumberKey: 'inboxCount'
          },
          {
            name: '我要办',
            topNumberKey: 'ybCount'
          }
        ],
        gridList: [
          {
            name: '登记',
          },
          {
            name: '申请',
          },
          {
            name: '退房',
          },
          {
            name: '维修',
          }
        ]
      },
      initData: {
        inboxCount: 60,
        ybCount: 10
      }
    }
  },
  watch: {

  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
    this.getInitData()
  },
  mounted() {
    let that = this;
    this.$nextTick(() => {
      this.resizeContentWrapperHeight();
    });
  },
  destroyed() {},
  methods: {
    hanldeClickButton(item) {
      if(item.clickFunction && item.clickFunction.length) {
        IDM.invokeCustomFunctions.apply(this,[item.clickFunction,{
          item,
          _this: this
        }])
      }
    },
    hanldeClickTotal(item) {
      if(item.clickFunction && item.clickFunction.length) {
        IDM.invokeCustomFunctions.apply(this,[item.clickFunction,{
          item,
          _this: this
        }])
      }
    },
    getInitData() {
      let that = this;
      let params = this.commonParam()
      if (this.propData.dataSource && this.propData.dataSource.length) {
        IDM.datasource.request(
          this.propData.dataSource[0].id, {
            moduleObject: this.moduleObject,
            _this: this,
            params
          },
          function (res) {
            that.initData = res;
          },
          function (error) {
            //这里是请求失败的返回结果
            console.log("error", error);
          }
        );
      } else {
        that.initData = getTurnoverRoomData()
      }
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.number = this.propData.numberCount ? this.propData.numberCount : 6;
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      if (this.propData.bgSize && this.propData.bgSize == "custom") {
        styleObject["background-size"] = (this.propData.bgSizeWidth ? this.propData.bgSizeWidth.inputVal + this.propData.bgSizeWidth.selectVal : "auto") + " " + (this.propData.bgSizeHeight ? this.propData.bgSizeHeight.inputVal + this.propData.bgSizeHeight.selectVal : "auto")
      } else if (this.propData.bgSize) {
        styleObject["background-size"] = this.propData.bgSize;
      }
      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject["background-position-x"] = this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject["background-position-y"] = this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
              styleObject['width'] = element;
              break
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
              IDM.style.setBoxStyle(styleObject, element)
              break;
            case "bgImgUrl":
              styleObject["background-image"] = `url(${window.IDM.url.getWebPath(element)})`;
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
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam() {
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId: window.IDM.broadcast && window.IDM.broadcast.pageModule ?
          window.IDM.broadcast.pageModule.id :
          "",
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
        filedExp =
          dataName +
          (filedExp.startsWiths("[") ? "" : ".") +
          filedExp;
        var dataObject = {
          IDM: window.IDM
        };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      //对结果进行再次函数自定义
      if (this.propData.customFunction && this.propData.customFunction.length > 0) {
        var params = this.commonParam();
        var resValue = "";
        try {
          resValue = window[this.propData.customFunction[0].name] && window[this.propData.customFunction[0].name].call(this, {
            ...params,
            ...this.propData.customFunction[0].param,
            moduleObject: this.moduleObject,
            expressData: _defaultVal,
            interfaceData: resultData
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
    resizeContentWrapperHeight(wrapperHeight) {
      let moduleHeight =
        this.propData.HeightType == "adaptive"
          ? $("#" + this.moduleObject.packageid)
              .parents(".fsl-region-element")
              .height()
          : this.propData.height;
      if ( this.propData.HeightType == "adaptive" && (wrapperHeight || moduleHeight) ) {
        //自适应父级容器
        moduleHeight = wrapperHeight || moduleHeight;

        //如果自适应则要减去上margin和下margin(因为margin、padding百分比都是相对父级宽度，所以要计算出实际的宽度值)
        //父级宽度值未知的，因为组件的宽度是100%显示的
        //所以计算公式为：(当前组件的宽度+左右margin实际数值)/(100-左右margin百分比总和)*100=实际宽度
        let iAttrArray = ["marginLeftVal", "marginRightVal"];
        let marginNumber = 0,
          marginRatio = 0;
        iAttrArray.forEach((item) => {
          if (
            this.propData.box &&
            this.propData.box[item] &&
            this.propData.box[item].indexOf("%") > -1
          ) {
            //用宽度计算出实际的px
            marginRatio += parseFloat(this.propData.box[item].replace("%", ""));
          } else if (this.propData.box && this.propData.box[item]) {
            marginNumber += parseFloat(
              this.propData.box[item].replace("px", "")
            );
          }
        });
        let module_width = this.$refs.module_ref.offsetWidth;
        //实际的100%的宽度
        const module_width_100 =
          ((module_width + marginNumber) / (100 - marginRatio)) * 100;

        let moduleTBMarginNumber = 0;
        iAttrArray = ["marginTopVal", "marginBottomVal"];
        iAttrArray.forEach((item) => {
          if (this.propData.box && this.propData.box[item]) {
            if (this.propData.box[item].indexOf("%") > -1) {
              //用宽度计算出实际的px
              moduleTBMarginNumber =
                moduleTBMarginNumber +
                (parseFloat(this.propData.box[item].replace("%", "")) / 100) *
                  module_width_100;
            } else {
              moduleTBMarginNumber =
                moduleTBMarginNumber +
                parseFloat(this.propData.box[item].replace("px", ""));
            }
          }
        });
        moduleHeight = moduleHeight - moduleTBMarginNumber;
      }
      this.moduleHeight = moduleHeight;
      this.convertAttrToStyleObject();
    },
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)
      // 配置了刷新KEY，消息类型是websocket，收到的消息对象有message并不为空
      if(this.propData.messageRefreshKey && this.propData.messageRefreshKey.length && object.type === 'websocket' && object.message){
        const messageData = typeof object.message === 'string' && JSON.parse(object.message) || object.message
        const arr = this.propData.messageRefreshKey || [];
        if(messageData.badgeType && arr.includes(messageData.badgeType)){
          this.getInitData()
        }
      }
      if ( object && object.type == "regionResize" && object.message && object.message.gridEleTarget ) {
        let gridEleTarget = object.message.gridEleTarget;
        if (gridEleTarget && gridEleTarget.offsetHeight) {
          this.$nextTick(() => {
            if ( this.propData.HeightType == "adaptive" && gridEleTarget.offsetHeight ) {
              this.resizeContentWrapperHeight(gridEleTarget.offsetHeight);
            }
          });
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
    }
  }
}
</script>

<style lang="scss" scoped>
.IOperateButton_app {
  padding: 10px 15px;
  >.title{
    color: rgba(0, 115, 202, 1);
  }
  .IOperateButton_app_main {
    align-items: stretch;
    .IOperateButton_app_left{
      .list{
        margin-bottom: 12px;
        padding: 10px 20px;
        cursor: pointer;
        box-shadow: 0px 2px 12px 0px rgba(0,0,0,0.07);
        border: 1px solid rgba(230,230,230,1);
        border-radius: 4px;
        &:last-child{
          margin-bottom: 0;
        }
        .list_left{
          width: 100%;
          padding-right: 15px;
          border-right: 1px solid #e0e0e0;
          .idm_button_svg_icon{
            font-size: 30px;
            width: 30px;
            height: 30px;
          }
        }
        .list_right{
          width: 100%;
          padding-left: 15px;
          white-space: nowrap;
          text-align: center;
          .number{
            margin-bottom: 4px;
            font-size: 24px;
            line-height: 24px;
            color: #333;
            font-weight: 600;
          }
          .name{
            font-size: 14px;
            line-height: 14px;
            color: #333;
          }
        }
      }
    }
    .IOperateButton_app_right{
      width: 100%;
      margin-left: 30px;
      padding: 0 20px;
      border: 1px solid #e0e0e0;
      .button_list{
        color: white;
        padding: 12px 20px;
        cursor: pointer;
        border-radius: 4px;
        background: rgba(0, 115, 202, 1);
      }
    }
  }
}
</style>

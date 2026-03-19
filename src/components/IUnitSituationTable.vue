<template>
  <!-- 单位预算执行情况表 -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    class="IUnitSituationTable"
  >
    <div class="head-main">
      <div class="item">
        <label>年份：</label>
        <div class="con">
          <a-select v-model="year" style="width: 120px" @change="initData">
            <a-select-option
              :value="item.value"
              v-for="item in yearOptions"
              :key="item.value"
            >
              {{ item.text }}
            </a-select-option>
          </a-select>
        </div>
      </div>
      <div class="item">
        <label>日期：</label>
        <div class="con">
          <a-range-picker
            v-model="dateTime"
            :format="dateFormat"
            @change="changeDate"
          />
        </div>
      </div>
      <span class="operation-btn primary">导出</span>
    </div>
    <div class="content-main">
      <div class="title">
        <h3>{{ year }}年单位预算执行情况表</h3>
        <h3 v-show="startDate && endDate">{{ startDate }} 至 {{ endDate }}</h3>
      </div>
      <div class="table-con">
        <div class="table-header">
          <table class="table">
            <thead>
              <tr>
                <th width="25%">项目</th>
                <th width="15%">年初预算</th>
                <th width="15%">调整金额</th>
                <th width="15%">调整后预算</th>
                <th width="15%">实际使用</th>
                <th width="15%">执行率</th>
              </tr>
            </thead>
          </table>
        </div>
        <div class="table-body scroll_block">
          <table class="table" v-if="tableData">
            <tbody>
              <tr>
                <td width="25%">{{ tableData.itemName }}</td>
                <td width="15%">
                  <span class="num">{{ tableData.initialBudgetAmount }}</span>
                </td>
                <td width="15%">
                  <span class="num">{{ tableData.adjustAmount }}</span>
                </td>
                <td width="15%">
                  <span class="num">{{ tableData.adjustedBudgetAmount }}</span>
                </td>
                <td width="15%">
                  <span class="num cursor" @click="goDetails(tableData)">{{
                    tableData.actualUsageAmount
                  }}</span>
                </td>
                <td width="15%">
                  <span class="num">{{ tableData.executionRate }}</span>
                </td>
              </tr>
              <tr v-for="item in itemData" :key="item.itemName">
                <td
                  class="text-left"
                  :style="{ 'padding-left': item.level + 'em' }"
                >
                  {{ item.itemName }}
                </td>
                <td>
                  <span class="num">{{ item.initialBudgetAmount }}</span>
                </td>
                <td>
                  <span class="num">{{ item.adjustAmount }}</span>
                </td>
                <td>
                  <span class="num">{{ item.adjustedBudgetAmount }}</span>
                </td>
                <td>
                  <span class="num cursor" @click="goDetails(item)">{{
                    item.actualUsageAmount
                  }}</span>
                </td>
                <td>
                  <span class="num">{{ item.executionRate }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tableData from "../mock/IUnitDeptTable.js";
import moment from "moment";
export default {
  name: "IUnitSituationTable",
  components: {},
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        loadDataCreated: true,
      },
      yearOptions: [],
      year: "",
      dateTime: [],
      startDate: "",
      endDate: "",
      dateFormat: "YYYY-MM-DD",
      tableData: {},
      itemData: [],
    };
  },
  watch: {},
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
  },
  mounted() {
    if (!this.moduleObject.env || this.moduleObject.env == "develop") {
      this.initData();
    } else {
      this.getYearOptions();
    }
  },
  destroyed() {},
  methods: {
    moment,
    getYearOptions() {
      IDM.http
        .get("ctrl/expenseManagement/getYearList", {})
        .done((res) => {
          if (res.code == "200") {
            this.yearOptions = res.data;
            this.year = this.yearOptions.filter(
              (item) => item.selected == true
            )[0].value;
            this.initData();
          }
        })
        .catch((err) => {});
    },
    initData() {
      console.log("加载数据");
      if (!this.moduleObject.env || this.moduleObject.env == "develop") {
        console.log(tableData.data1.data);
        const result = tableData.data1.data;
        this.tableData = result;
        this.itemData = this.flattenAllChildren(result);
        this.$nextTick(() => {
          this.changeTableWidth();
        });
      } else {
        const params = {
          year: this.year,
          startDate: this.startDate,
          endDate: this.endDate,
        };
        IDM.http
          .post(
            "ctrl/expenseManagement/getUnitBudgetExecutionStatistics",
            params
          )
          .done((res) => {
            this.tableData = {};
            this.itemData = [];
            if (res.code == "200") {
              const result = res.data;
              this.tableData = result;
              this.itemData = this.flattenAllChildren(result);
            }
            this.$nextTick(() => {
              this.changeTableWidth();
            });
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    flattenAllChildren(data) {
      let result = [];
      // 递归函数
      function traverse(node, level) {
        if (node.children && node.children.length > 0) {
          level++;
          node.children.forEach((child) => {
            child.level = level;
            result.push(child);
            traverse(child, level);
          });
        }
      }
      traverse(data, 0); // 从根节点开始遍历
      return result;
    },
    changeTableWidth() {
      $(".table-header").width($(".table-body table").width());
      window.onresize = () => {
        $(".table-header").width($(".table-body table").width());
      };
    },
    changeDate(date, dateString) {
      this.startDate = dateString[0] ? dateString[0] : "";
      this.endDate = dateString[1] ? dateString[1] : "";
      console.log("时间", this.startDate, this.endDate);
      this.initData();
    },
    goDetails(item) {
      console.log(item);
      let url = IDM.url.getWebPath(
        "ctrl/list/2603111753337w9P3CZiKzNGGSonoLf?moduleId=260115164011ItK50SrF9FxkO36bOrR"
      );
      for (let field in item.queryCondition) {
        url += "&" + field + "=" + (item.queryCondition[field] || "");
      }
      window.open(url);
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
      if (object.type && object.type == "linkageReload") {
        this.getLoginStatus();
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
    },
  },
};
</script>
<style lang="scss" scoped>
.IUnitSituationTable {
  width: 100%;
  height: 100% !important;
  background: #ffffff;
  color: #333;
  font-size: 16px;
  padding: 20px;
  .head-main {
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    .item {
      display: flex;
      align-items: center;
      margin-right: 10px;
    }
    .operation-btn {
      display: inline-block;
      cursor: pointer;
      border: 1px solid rgba(201, 201, 201, 1);
      border-radius: 2px;
      line-height: 30px;
      padding: 0 20px;
      margin-left: 12px;
      font-size: 16px;
      cursor: pointer;

      &.primary {
        background: #0086d9;
        border-color: #0086d9;
        color: #fff;
      }
    }
  }
  .content-main {
    height: calc(100% - 50px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    .title {
      text-align: center;
      font-size: 20px;
      margin-bottom: 15px;
      h3 {
        margin-bottom: 0;
      }
    }
    .table-con {
      flex: 1;
      position: relative;
      padding-top: 50px;
      overflow: hidden;
    }
    .table-header {
      position: absolute;
      top: 0;
      left: 0;
      width: calc(100% - 8px);
    }
    .table-body {
      height: 100%;
      overflow-y: auto;
    }
    .table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      tr {
        th,
        td {
          border: 1px solid #e6e6e6;
          text-align: center;
        }
        th {
          background: #f9fcfe;
          font-weight: 500;
          height: 50px;
        }
        td {
          padding: 8px;
          .cursor {
            color: #027dff;
            font-weight: 600;
            cursor: pointer;
            &:hover {
              text-decoration: underline;
            }
          }
        }
        .text-left {
          text-align: left;
        }
        .text-right {
          text-align: right;
        }
        .ellipsis {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}
</style>


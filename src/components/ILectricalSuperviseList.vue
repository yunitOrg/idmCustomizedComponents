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
    class="idm-lectrical-supervise-list-out"
  >
    <div class="header-box">督办统计</div>
    <div class="header-content">
      <div class="fifter-box">
        <div class="form-item">
          <div class="form-item-label">年份：</div>
          <div class="form-item-content">
            <a-select
              v-model="year"
              style="width: 120px"
              @change="handleChange"
            >
              <a-select-option
                v-for="item in yearList"
                :key="item.value"
                :value="item.value"
                >{{ item.text }}
              </a-select-option>
            </a-select>
          </div>
        </div>
        <div class="form-item">
          <div class="form-item-label">部门：</div>
          <div class="form-item-content">
            <a-select
              v-model="dept"
              style="width: 120px"
              @change="handleChange"
            >
              <a-select-option
                v-for="item in deptList"
                :key="item.value"
                :value="item.value"
                >{{ item.text }}
              </a-select-option>
            </a-select>
          </div>
        </div>
      </div>
      <div class="list-box">
        <a-button
          v-for="(item, index) in atnList"
          :key="index"
          :value="item.value"
          type="primary"
          ghost
          >{{ item.text }} {{ item.value }}</a-button
        >
      </div>
    </div>

    <div class="section-box">项目情况</div>
    <div class="section-content">
      <div class="stats-row">
        <div class="stat-card" v-for="item in stats" :key="item.status">
          <svg-icon :iconClass="item.icon" class="stat-icon" />
          <div class="stat-info">
            <span class="num">{{ item.total }}</span>
            <span class="label">{{ item.status }}</span>
          </div>
        </div>
      </div>

      <div class="echarts-box">
        <div ref="chartPie" style="height: 400px"></div>
        <div ref="chartBarDept" style="height: 400px"></div>
        <div ref="chartBarSource" style="height: 400px"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "ILectricalSuperviseList",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      yearList: [
        {
          value: "2026",
          text: "2026年",
        },
        {
          value: "2025",
          text: "2025年",
        },
        {
          value: "2024",
          text: "2024年",
        },
      ],
      year: "2026",
      dept: "",
      deptList: [
        {
          value: "",
          text: "全部",
        },
        {
          value: "10",
          text: "10",
        },
        {
          value: "20",
          text: "20",
        },
        {
          value: "30",
          text: "30",
        },
      ],
      atnList: [
        {
          text: "督办工作专报",
          value: "1",
        },
        {
          text: "督办工作专报",
          value: "2",
        },
        {
          text: "督办工作专报",
          value: "3",
        },
      ],
      stats: [
        {
          status: "项目",
          total: 100,
          icon: "xiangmu",
        },
        {
          status: "办结",
          total: 200,
          icon: "banjie",
        },
        {
          status: "在办",
          total: 300,
          icon: "zaiban",
        },
        {
          status: "超期",
          total: 300,
          icon: "chaoqi",
        },
        {
          status: "变更",
          total: 300,
          icon: "biangeng",
        },
      ],
      chartPie: null,
      chartBarDept: null,
      chartBarSource: null,
      deptData: {
        categories: [
          "办公室",
          "战略发展部",
          "科技创新部",
          "财务资产部",
          "企业管理部",
          "党委组织部",
          "市场部",
          "法律合规部",
          "党建工作部",
          "纪委监督执纪",
          "党委巡视办",
        ],
        dataIn: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        dataOverdue: [1, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0],
        dataFinished: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
      sourceData: {
        categories: [
          "职工代表提案",
          "决策会议",
          "月度运营分析会",
          "重点工作推进会",
          "年中工作会议",
          "年度工作会议",
          "领导班子碰头会",
          "国务院国资委重大事项",
          "习近平总书记指示批示",
        ],
        dataIn: [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0],
        dataOverdue: [1, 0, 14, 0, 0, 0, 0, 0, 0, 0, 0],
        dataFinished: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      },
    };
  },
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
  },
  mounted() {
    this.$nextTick(() => {
      this.initCharts();
      window.addEventListener("resize", this.resizeCharts);
    });
  },
  destroyed: function () {
    // 清理 ECharts 实例和事件监听器
    if (this.chartPie) this.chartPie.dispose();
    if (this.chartBarDept) this.chartBarDept.dispose();
    if (this.chartBarSource) this.chartBarSource.dispose();

    window.removeEventListener("resize", this.resizeCharts);
  },
  methods: {
    initCharts: function () {
      this.initPieChart();
      this.initDeptBarChart();
      this.initSourceBarChart();
    },
    resizeCharts: function () {
      if (this.chartPie) this.chartPie.resize();
      if (this.chartBarDept) this.chartBarDept.resize();
      if (this.chartBarSource) this.chartBarSource.resize();
    },
    initPieChart: function () {
      var chart = echarts.init(this.$refs.chartPie);
      this.chartPie = chart;

      var option = {
        title: {
          // text: "项目状态分布",
          left: "center",
          top: 10,
          textStyle: { fontSize: 14 },
        },
        tooltip: { trigger: "item" },
        legend: { bottom: 5, left: "center", orient: "horizontal" },
        series: [
          {
            name: "状态",
            type: "pie",
            radius: ["40%", "60%"],
            avoidLabelOverlap: false,
            label: { show: false },
            emphasis: { label: { show: true } },
            data: [
              { value: 3, name: "在办", itemStyle: { color: "#e6a23c" } },
              { value: 2, name: "办结", itemStyle: { color: "#67c23a" } },
              { value: 26, name: "超期", itemStyle: { color: "#f56c6c" } },
            ],
          },
        ],
      };
      chart.setOption(option);
    },
    initDeptBarChart: function () {
      var chart = echarts.init(this.$refs.chartBarDept);
      this.chartBarDept = chart;

      var option = {
        title: {
          // text: "各部门项目情况",
          left: "center",
          top: 10,
          textStyle: { fontSize: 14 },
        },
        tooltip: { trigger: "axis" },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "10%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "category",
          data: this.deptData.categories,
          axisLabel: { interval: 0, rotate: 45 },
        },
        yAxis: { type: "value" },
        series: [
          {
            name: "超期",
            type: "bar",
            stack: "total",
            barWidth: "60%",
            itemStyle: { color: "#f56c6c" },
            data: this.deptData.dataOverdue,
          },
          {
            name: "在办",
            type: "bar",
            stack: "total",
            itemStyle: { color: "#e6a23c" },
            data: this.deptData.dataIn,
          },
          {
            name: "办结",
            type: "bar",
            stack: "total",
            itemStyle: { color: "#67c23a" },
            data: this.deptData.dataFinished,
          },
        ],
      };
      chart.setOption(option);
    },
    initSourceBarChart: function () {
      var chart = echarts.init(this.$refs.chartBarSource);
      this.chartBarSource = chart;

      var option = {
        title: {
          // text: "项目来源分布",
          left: "center",
          top: 10,
          textStyle: { fontSize: 14 },
        },
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: { left: "25%", right: "4%", bottom: "5%", top: "15%" },
        xAxis: { type: "value", boundaryGap: [0, 0.01] },
        yAxis: {
          type: "category",
          data: this.sourceData.categories,
          axisLabel: { fontSize: 12 },
        },
        series: [
          {
            name: "超期",
            type: "bar",
            stack: "total",
            barWidth: "60%",
            itemStyle: { color: "#f56c6c" },
            data: this.deptData.dataOverdue,
          },
          {
            name: "在办",
            type: "bar",
            stack: "total",
            itemStyle: { color: "#e6a23c" },
            data: this.deptData.dataIn,
          },
          {
            name: "办结",
            type: "bar",
            stack: "total",
            itemStyle: { color: "#67c23a" },
            data: this.deptData.dataFinished,
          },
        ],
      };
      chart.setOption(option);
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
      let that = this;
      //所有地址的url参数转换
      var params = that.commonParam();
      switch (this.propData.dataSourceType) {
        case "customInterface":
          this.propData.customInterfaceUrl &&
            window.IDM.http
              .get(this.propData.customInterfaceUrl, params)
              .then((res) => {
                //res.data
                that.$set(
                  that.propData,
                  "fontContent",
                  that.getExpressData(
                    "resultData",
                    that.propData.dataFiled,
                    res.data,
                  ),
                );
                // that.propData.fontContent = ;
              })
              .catch(function (error) {});
          break;
        case "pageCommonInterface":
          //使用通用接口直接跳过，在setContextValue执行
          break;
        case "customFunction":
          if (
            this.propData.customFunction &&
            this.propData.customFunction.length > 0
          ) {
            var resValue = "";
            try {
              resValue =
                window[this.propData.customFunction[0].name] &&
                window[this.propData.customFunction[0].name].call(this, {
                  ...params,
                  ...this.propData.customFunction[0].param,
                  moduleObject: this.moduleObject,
                });
            } catch (error) {}
            that.propData.fontContent = resValue;
          }
          break;
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
      // if(object.type&&object.type=="linkageShowModule"){
      //   this.showThisModuleHandle();
      // }else if(object.type&&object.type=="linkageHideModule"){
      //   this.hideThisModuleHandle();
      // }
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
.idm-lectrical-supervise-list-out {
  padding: 20px;

  .header-box {
    height: 50px;
    padding: 0 20px;
    padding-left: 30px;
    border: 1px solid #eee;
    font-size: 18px;
    line-height: 50px;
    position: relative;

    &::before {
      content: "";
      display: inline-flex;
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      width: 4px;
      height: 18px;
      background-color: #007bff;
      margin-right: 5px;
    }
  }

  .header-content {
    padding: 0 20px;
  }

  .fifter-box {
    padding: 20px 0;
    display: flex;
    .form-item {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      margin-right: 20px;
    }
    .form-item-label {
      text-align: right;
      margin-right: 10px;
    }
    .form-item-content {
      flex: 1;
    }
  }

  .list-box {
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
  }

  .section-box {
    height: 50px;
    padding: 0 20px;
    padding-left: 30px;
    font-size: 20px;
    font-weight: 600;
    line-height: 50px;
    position: relative;
    margin-top: 10px;

    &::before {
      content: "";
      display: inline-flex;
      position: absolute;
      top: 50%;
      left: 20px;
      transform: translateY(-50%);
      width: 4px;
      height: 20px;
      background-color: #007bff;
      margin-right: 5px;
    }
  }

  .section-content {
    padding: 0 20px;
  }

  .stats-row {
    display: flex;
    gap: 20px;
    margin-bottom: 30px;
    flex-wrap: wrap;

    .stat-card {
      flex: 1;
      min-width: 120px;
      padding: 30px 20px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      color: #fff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      .stat-icon {
        font-size: 28px;
        margin-right: 15px;
        opacity: 0.9;
      }

      .num {
        font-size: 24px;
        font-weight: bold;
        display: block;
      }
      .label {
        font-size: 14px;
        opacity: 0.9;
      }

      &:first-child {
        background: linear-gradient(135deg, #409eff, #66b1ff);
      }
      &:nth-child(2) {
        background: linear-gradient(135deg, #67c23a, #85ce61);
      }
      &:nth-child(3) {
        background: linear-gradient(135deg, #e6a23c, #ebb563);
      }
      &:nth-child(4) {
        background: linear-gradient(135deg, #67c23a, #85ce61);
      }
      &:nth-child(5) {
        background: linear-gradient(135deg, #f56c6c, #f78989);
      }
    }
  }

  .echarts-box {
    display: flex;
    gap: 20px;
    & > div {
      flex: 1;
    }
  }
}
</style>

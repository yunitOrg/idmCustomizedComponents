<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="InternalReferenceSubmission_app">
    <div class="InternalReferenceSubmission_app_header flex_end">
      <div class="select_box">
        <a-select 
          v-model="currentYear" 
          :options="yearList" 
          style="width: 100%;" 
          placeholder="年份"
          @change="handleChangeYear"
          allowClear
        />
      </div>
    </div>
    <div class="InternalReferenceSubmission_app_main flex_between">
      <div class="InternalReferenceSubmission_app_left">
        <vue-scroll :ops="scrollOps">
          <div v-for="(item,index) in dataList" :key="index" class="item">
            <div class="header">
              {{ item.title }}
            </div>
            <div class="main">
              <div @click="handleClickItem(item, 1)" class="row flex_between">
                <div class="left">
                  <div class="img_box">
                    <img :src="getImageSrc('','item1')" alt="">
                  </div>
                </div>
                <div class="right flex_between">
                  <div class="row_right_left flex_start">
                    <img :src="getImageSrc('','star')" alt="">
                    <span class="name">刊发期数</span>
                  </div>
                  <div class="row_right_right">
                    <span class="number">8</span>
                    <span class="unit">（期）</span>
                  </div>
                </div>
              </div>
              <div @click="handleClickItem(item, 2)" class="row flex_between">
                <div class="left">
                  <div class="img_box">
                    <img :src="getImageSrc('','item2')" alt="">
                  </div>
                </div>
                <div class="right flex_between">
                  <div class="row_right_left flex_start">
                    <img :src="getImageSrc('','star')" alt="">
                    <span class="name">批示数</span>
                  </div>
                  <div class="row_right_right">
                    <span class="number">5</span>
                    <span class="unit">（件）</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </vue-scroll>
      </div>
      <div class="InternalReferenceSubmission_app_right">
        <div class="main">
          <div class="title">
            《{{ title }}》工作情况
          </div>
          <div class="operate_block flex_end">
            <a-button type="primary">打印</a-button>
          </div>
          <div class="table_block" ref="table_block">
            <a-table 
              :columns="tableColumns" 
              :data-source="tableData" 
              bordered 
              :scroll="tableScroll" 
              rowKey="id"
              :pagination="tablePagination"
              @change="tableChange"
            >
            </a-table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import vuescroll from '../mixins/vueScroll'

export default {
  name: 'InternalReferenceSubmission',
  mixins: [ vuescroll ],
  data(){
    return {
      moduleObject:this._moduleObject||{},
      propData:this._propData?.compositeAttr||this.$root?.propData?.compositeAttr ||{
        accordion: false
      },

      yearList: [],
      currentYear: undefined,
      dataList: [
        {
          id: 1,
          title: "调研专报",
          children: [
            {
              name: "刊发期数",
              number: 8
            },
            {
              name: "批示数",
              number: 5
            }
          ]
        },
        {
          id: 2,
          title: "决策咨询",
          children: [
            {
              name: "刊发期数",
              number: 8
            },
            {
              name: "批示数",
              number: 5
            }
          ]
        },
        {
          id: 3,
          title: "工作专报",
          children: [
            {
              name: "刊发期数",
              number: 8
            },
            {
              name: "批示数",
              number: 5
            }
          ]
        },
        {
          id: 4,
          title: "白头专报",
          children: [
            {
              name: "刊发期数",
              number: 8
            },
            {
              name: "批示数",
              number: 5
            }
          ]
        },
      ],
      title: '调研专报',
      tableData: [
        {
          id: 1,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 2,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 3,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 4,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 5,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 6,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 7,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 8,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 9,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
        {
          id: 10,
          year: '2021',
          number: '1',
          day: '2021-01-01',
          name: '调研专报',
          depart: '部门',
          author: '作者',
          status: '未批示',
          have: '是',
          remark: '备注'
        },
      ],
      tableColumns: [
        {
          title: '年份',
          dataIndex: 'year',
          key: 'year',
          align: 'center',
          width: 100
        },
        {
          title: '期数',
          dataIndex: 'number',
          key: 'number',
          align: 'center',
          width: 100
        },
        {
          title: '报送日期',
          dataIndex: 'day',
          key: 'day',
          align: 'center',
          width: 120
        },
        {
          title: '篇名',
          dataIndex: 'name',
          align: 'center',
          key: 'name',
        },
        {
          title: '完成部门',
          dataIndex: 'depart',
          align: 'center',
          key: 'depart',
        },
        {
          title: '作者',
          dataIndex: 'author',
          align: 'center',
          key: 'author',
        },
        {
          title: '批示情况',
          dataIndex: 'status',
          align: 'center',
          key: 'status',
        },
        {
          title: '是否调研计划',
          dataIndex: 'have',
          align: 'center',
          key: 'have',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          align: 'center',
          key: 'remark',
        }
      ],
      tablePagination: {
        total: 0,
        current: 1,
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '30', '40', '50'],
      },
      tableScroll: {
        y: 222
      }
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
    this.getYearList()
    this.getInitData()
  },
  mounted() {
    let that = this;
    this._moduleObject&&IDM.callBackComponentMountComplete?.apply(this,[this._moduleObject]);
    window.addEventListener('resize', function() {
      if(that.$refs?.table_block?.clientHeight) {
        that.tableScroll = {
          y: that.$refs.table_block.clientHeight - 120
        }
      }
    })
    setTimeout(() => {
      if(that.$refs?.table_block?.clientHeight) {
        that.tableScroll = {
          y: that.$refs.table_block.clientHeight - 120
        }
      }
    }, 100)
  },
  destroyed() {},
  methods:{
    tableChange(pagination) {
      console.log('tableChange', pagination)
      this.tablePagination.current = pagination.current;
      this.tablePagination.pageSize = pagination.pageSize;
      this.getTableData()
    },
    handleClickItem(item,type) {
      this.title = item.title
    },
    handleChangeYear(e) {
      console.log('yearList',e)
    },
    getYearList() {
      let yearList = [];
      let currentYear = new Date().getFullYear();
      for (let i = 0; i < 15; i++) {
        yearList.push({
          value: currentYear + 1 - i,
          label: `${currentYear + 1 - i}年`
        })
      }
      this.currentYear = currentYear;
      this.yearList = yearList;
    },
    handleClickUser(item) {
      IDM.invokeCustomFunctions.apply(this, [this.propData.customFunction, {
        item,
        _this: this
      }])
    },
    handleClickHeader(item) {
      if(this.propData.accordion) {
        this.activeOrgId = item.id == this.activeOrgId?.[0] ? [] : [item.id]
      } else {
        if(this.activeOrgId.indexOf(item.id) == -1) {
          this.activeOrgId.push(item.id)
        } else {
          this.activeOrgId.splice(this.activeOrgId.indexOf(item.id),1)
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
            that.activeOrgId = [that.dataList[0].id]
          }
        },function(error){
          console.log('error',error)
        })
      } else {
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
        return IDM.url.getModuleAssetsWebPath(require(`../assets/InternalReferenceSubmission/${name}.png`),this.moduleObject)
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
@import '../styles/fonts.css';
.InternalReferenceSubmission_app{
  height: 100vh;
  background: url('../assets/InternalReferenceSubmission/bg.png');
  .InternalReferenceSubmission_app_header{
    height: 86px;
    padding: 0 25px;
    background: url('../assets/InternalReferenceSubmission/headerBg.png');
    .select_box{
      width: 112px;
      position: relative;
      top: -10px;
      border: 1px solid #95DBFF;
      box-shadow: inset 0 1px 3px 4px rgba(61,223,255,0.50);
      border-radius: 6px;
      .ant-select-selection{
        background-color: rgba(250,250,250,0);
      }
    }
  }
  .InternalReferenceSubmission_app_main{
    height: calc(100vh - 86px);
    padding: 10px 30px 0 37px;
    .InternalReferenceSubmission_app_left{
      height: 100%;
      width: 578px;
      margin-right: 17px;
      .item{
        height: 228px;
        margin-bottom: 15px;
        padding: 10px 29px 10px 25px;
        background: rgba(250,250,250,0.30);
        background-image: url('../assets/InternalReferenceSubmission/itemBg.png');
        background-size: 100% 100%;
        background-repeat: no-repeat;
        &>.header{
          height: 31px;
          line-height: 31px;
          padding-left: 12px;
          font-family: YouSheBiaoTiHei;
          font-size: 22px;
          color: #077CC8;
          letter-spacing: 3.06px;
          font-weight: 400;
        }
        &>.main{
          &>.row{
            margin-bottom: 14px;
            &:last-child{
              margin-bottom: 0;
            }
            &>.left{
              margin-right: 28px;
              .img_box{
                width: 68px;
                height: 73px;
                overflow: hidden;
                img{
                  width: 100%;
                  height: 100%;
                }
              }
            }
            &>.right{
              height: 38px;
              flex-grow: 2;
              padding: 0 30px 0 18px;
              background-image: linear-gradient(264deg, rgba(240,248,255,0.00) 15%, #DCEEFF 85%);
              cursor: pointer;
              .row_right_left{
                img{
                  margin-right: 28px;
                }
                .name{
                  font-family: SourceHanSansSC-Medium;
                  font-size: 16px;
                  color: #333333;
                  letter-spacing: 2.22px;
                  font-weight: 500;
                }
              }
              .row_right_right{
                .number{
                  font-family: SourceHanSansSC-Heavy;
                  font-size: 24px;
                  color: #0077AF;
                  letter-spacing: 3.33px;
                  text-align: center;
                  font-weight: 900;
                }
                .unit{
                  font-family: SourceHanSansSC-Regular;
                  font-size: 14px;
                  color: #577A97;
                  letter-spacing: 1.94px;
                  font-weight: 400;
                }
              }
            }
          }
        }
      }
    }
    .InternalReferenceSubmission_app_right{
      width: calc(100% - 578px);
      height: 100%;
      flex-grow: 2;
      padding: 10px 0 20px 0;
      &>.main{
        height: 100%;
        padding: 8px 20px 0 40px;
        background: rgba(255,255,255,0.45);
        border: 2px solid rgba(255,255,255,1);
        border-radius: 10px;
        &>.title{
          margin-bottom: 20px;
          font-family: SourceHanSansSC-Bold;
          font-size: 30px;
          color: #333333;
          letter-spacing: 2.67px;
          text-align: center;
          font-weight: 700;
        }
        .operate_block{
          margin-bottom: 10px;
        }
        .table_block{
          height: calc(100% - 110px);
        }
      }
    }
  }
}
</style>
<style lang="scss">
.InternalReferenceSubmission_app{
  .select_box{
    .ant-select-selection{
      color: white;
      background-color: rgba(250,250,250,0);
      .anticon{
        color: white;
      }
      .ant-select-selection__clear{
        background-color: rgba(250,250,250,0);
      }
    }
  }
  .table_block{
    background-color: rgba(250,250,250,0);
    .ant-table-header{
      background:  #E6F7FF;
    }
    .ant-table-placeholder{
      background-color: rgba(250,250,250,0);
    }
    .ant-table-thead > tr > th{
      font-family: SourceHanSansSC-Regular;
      // font-size: 18px;
      color: #6E91B0;
      letter-spacing: 1.6px;
      text-align: center;
      font-weight: 400;
      background: #E6F7FF;
    }
    .ant-table-fixed-header > .ant-table-content > .ant-table-scroll > .ant-table-body{
      background-color: rgba(250,250,250,0);
    }
  }
}
</style>
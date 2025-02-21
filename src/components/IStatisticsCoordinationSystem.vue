<template>
<div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IStatisticsCoordinationSystem_app">
  <div class="IStatisticsCoordinationSystem_app_header flex_between">
    <div class="IStatisticsCoordinationSystem_app_header_left">
      {{ propData.title }}
    </div>
    <div class="IStatisticsCoordinationSystem_app_header_right">
      <div class="select_box">
        <a-select 
          v-model="currentYear" 
          :options="yearList" 
          style="width: 100%;" 
          placeholder="请选择年份"
          @change="handleChangeYear"
        />
      </div>
    </div>
  </div>
  <div class="main">
    <div class="IStatisticsCoordinationSystem_app_swiper">
      <div class="img_box">
        <img :src="getImageSrc('', 'banner')" alt="">
      </div>
    </div>
    <div class="IStatisticsCoordinationSystem_app_nav">
      <div class="top flex_between">
        <div @click="handleChangeType(item)" v-for="item in navTopList" :key="item" class="list" :class="type == item.value ? 'active' : ''">
          <img :src="getImageSrc('', item.imgName)">
        </div>
      </div>
      <div v-if="type == 4 && leaderList?.length" class="bottom flex_center">
        <div @click="handleClickLeader(item)" v-for="(item,index) in leaderList" :key="index" class="list flex_between" :class="leaderId == item.id ? 'active' : ''">
          <div class="img_box">
            <img :src="getImageSrc(item.photo, 'leader')" alt="">
          </div>
          <div class="name">{{ item.name }}</div>
        </div>
      </div>
    </div>
    <div class="IStatisticsCoordinationSystem_app_body flex_between">
      <div class="left">
        <vue-scroll :ops="scrollOps">
          <template v-if="treelist?.length">
            <ITreeItem :tree_data="treelist" :active_item="active_item"></ITreeItem>
          </template>
          <template v-else>
            <a-empty description="暂无数据"/>
          </template>
        </vue-scroll>
      </div>
      <div class="right">
        <div v-if="describe" class="table_descibe">
          {{ describe }}
        </div>
        <div class="right_top flex_end">
          <a-button @click="exportData" type="primary">导出</a-button>
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
            <span slot="ngdate" slot-scope="text">
              {{ makeTimeFormat(text) }}
            </span>
            <span slot="action" slot-scope="text, record">
              <a-space>
                <a-button type="primary" @click="edit(record)">维护</a-button>
                <a-button type="danger" @click="deleteRecord(record)">删除</a-button>
              </a-space>
            </span>
          </a-table>
        </div>
      </div>
    </div>
  </div>
  
</div>
</template>

<script>
import ITreeItem from '../commonComponents/ITreeItem'
import vuescroll from '../mixins/vueScroll'
import dayjs from 'dayjs'
export default {
  name: 'IStatisticsCoordinationSystem',
  mixins: [ vuescroll ],
  components: {
    ITreeItem
  },
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        title: "上海市统计局“四责协同”工作管理平台"
      },
      currentYear: "",
      yearList: [],
      navTopList: [
        {
          value: 1,
          imgName: "nav1"
        },
        {
          value: 2,
          imgName: "nav2"
        },
        {
          value: 3,
          imgName: "nav3"
        },
        {
          value: 4,
          imgName: "nav4"
        }
      ],
      type: 1,
      leaderId: '',
      leaderList: [ ],
      treelist: [ ],
      active_item: {
        active: ''
      },
      tableColumns: [
        
      ],
      pageNumber: 1,
      pageSize: 1,
      tableData: [ ],
      describe: '',
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
  props: {},
  watch: {
    "active_item": {
      handler(newValue, oldValue) {
        if(newValue?.active) {
          this.getTableData()
        } else {
          this.tableData = []
        }
      },
      deep: true
    }
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
    this.getYearList()
    this.getTableColumns()
    this.getProjectTreeList()
  },
  mounted() {
    let that = this;
    window.addEventListener('resize', function() {
      if(that.$refs?.table_block?.clientHeight) {
        that.tableScroll = {
          y: that.$refs.table_block.clientHeight - 100
        }
      }
    })
    setTimeout(() => {
      if(that.$refs?.table_block?.clientHeight) {
        that.tableScroll = {
          y: that.$refs.table_block.clientHeight - 100
        }
      }
    }, 100)
  },
  destroyed() {},
  methods: {
    getTableColumns() {
      this.tableColumns = [
        {
          title: '序号',
          width: 100,
          customRender: (text, record, index) => {
            return index + 1
          }
        },
        {
          title: '时间',
          width: 200,
          dataIndex: 'ngdate',
          key: 'ngdate',
          scopedSlots: { customRender: 'ngdate' },
        },
        {
          title: '内容',
          dataIndex: 'bt',
          key: 'bt',
        }
      ]
      if(this.propData.isEdit) {
        this.tableColumns.push({
          title: '操作',
          key: 'action',
          width: 180,
          scopedSlots: { customRender: 'action' },
        })
      }
    },
    exportData() {
      if(this.propData.clickExportFunction?.length) {
        IDM.invokeCustomFunctions.apply(this,[this.propData.clickExportFunction,{
          _this: this
        }])
      }
    },
    tableChange(pagination) {
      console.log('tableChange', pagination)
      this.tablePagination.current = pagination.current;
      this.tablePagination.pageSize = pagination.pageSize;
      this.getTableData()
    },
    edit(item) {
      console.log('编辑',item)
      if(this.propData.clickEditFunction?.length) {
        IDM.invokeCustomFunctions.apply(this,[this.propData.clickEditFunction,{
          item,
          _this: this
        }])
      }
    },
    deleteRecord(item) {
      console.log('删除', item)
      let that = this
      this.$confirm({
        title: '提示',
        content: "删除记录，是否确认?",
        onOk() {
          console.log('OK');
          that.deleteRecordSubmit(item)
        },
        onCancel() {
          console.log('Cancel');
        }
      });
      
    },
    deleteRecordSubmit(item) {
      IDM.http.post('ctrl/fourSynergies/delRecordById', {
        id: item.id
      }).then((res) => {
        IDM.message.success('删除成功')
        this.getTableData()
      }).catch((err) => {
        console.log(err)
      })
    },
    makeTimeFormat(time) {
      return dayjs(time).format('YYYY-MM-DD')
    },
    getTableData() {
      if(!this.active_item?.active) {
        return
      }
      IDM.http.get('ctrl/fourSynergies/getRecordById', {
        id: this.active_item.active,
        pageNumber: this.tablePagination.current,
        pageSize: this.tablePagination.pageSize
      }).then((res) => {
        this.tableData = res.data.data?.data || [];
        this.tablePagination.total = res.data?.data?.total;
        this.describe = res.data.data?.describe;
      }).catch((err) => {
        console.log(err)
      })
    },
    handleChangeType(item) {
      this.type = item.value
      if(item.value == 4) {
        this.getLeaderList()
      } else {
        this.getProjectTreeList()
      }
    },
    getLeaderList() {
      IDM.http.get('ctrl/fourSynergies/getLeader', {
        
      }).then((res) => {
        this.leaderList = res.data.data
        if(this.leaderList?.length) {
          this.leaderId = this.leaderList[0]?.id
          this.getProjectTreeList()
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    handleClickLeader(item) {
      this.leaderId = item.id
      this.getProjectTreeList()
    },
    // 获取项目树列表
    getProjectTreeList() {
      let that = this;
      IDM.http.get('ctrl/fourSynergies/getTreeDocumentaryProject', {
        type: this.type,
        year: this.currentYear,
        leaderId: this.type != 4 ? undefined :this.leaderId
      }).then((res) => {
        this.treelist = res.data.data
        if(this.treelist?.length) {
          this.active_item.active =  this.treelist[0]?.id 
        } else {
          this.active_item.active =  "" 
        }
      }).catch((err) => {
        console.log(err)
      })
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
    handleChangeYear(e) {
      console.log(e)
      this.getProjectTreeList()
    },
    getImageSrc(url, name) {
      if (url) {
        return IDM.url.getWebPath(url)
      } else {
        return IDM.url.getModuleAssetsWebPath(require(`../assets/${name}.png`), this.moduleObject)
      }
    },
    makeParamsData(data) {
      let result = {};
      if (this.propData.paramsMakeFunction && this.propData.paramsMakeFunction.length && window[this.propData.paramsMakeFunction[0].name]) {
        result = window[this.propData.paramsMakeFunction[0].name].call(this, {
          ...data,
          ...this.propData.paramsMakeFunction[0].param,
          moduleObject: this.moduleObject,
          _this: this
        });
        console.log('自定义参数函数', result)
        return result
      }
      return data
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
            case "height":
              styleObject[key] = element;
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
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object)
      // 配置了刷新KEY，消息类型是websocket，收到的消息对象有message并不为空
      if(this.propData.messageRefreshKey && this.propData.messageRefreshKey.length && object.type === 'websocket' && object.message){
        const messageData = typeof object.message === 'string' && JSON.parse(object.message) || object.message
        const arr = this.propData.messageRefreshKey || [];
        if(messageData.badgeType && arr.includes(messageData.badgeType)){
          this.getTableData()
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
.IStatisticsCoordinationSystem_app {
  height: 100vh;
  background: #f5f5f5;
  .IStatisticsCoordinationSystem_app_header{
    width: 100%;
    height: 70px;
    padding: 0 20px 0 29px;
    background: #FFFFFF;
    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.08);
    .IStatisticsCoordinationSystem_app_header_left{
      font-family: AlibabaPuHuiTi-Bold;
      font-size: 28px;
      color: #333333;
      font-weight: 700;
    }
    .IStatisticsCoordinationSystem_app_header_right{
      .select_box{
        width: 96px;
      }
    }
  }
  &>.main{
    height: calc(100% - 70px);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 0 20px 17px 20px;
    .IStatisticsCoordinationSystem_app_swiper{
      width: 100%;
      margin: 17px 0px 0 0px;
    }
    .IStatisticsCoordinationSystem_app_nav{
      width: 100%;
      margin: 15px 0px 0 0px;
      padding: 20px 70px 20px 70px;
      background: #FFFFFF;
      border-radius: 10px;
      .top{
        .list{
          margin-right: 30px;
          cursor: pointer;
          border-radius: 8px;
          &:last-child{
            margin-right: 0;
          }
        }
        .active{
          box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.3);
        }
      }
      .bottom{
        flex-wrap: wrap;
        margin-top: 34px;
        .list{
          margin-right: 80px;
          cursor: pointer;
          font-size: 16px;
          color: #333333;
          font-weight: 400;
          &:last-child{
            margin-right: 0;
          }
          .img_box{
            width: 48px;
            height: 48px;
            margin-right: 16px;
            img{
              width: 48px;
              height: 48px;
              border-radius: 50%;
            }
          }
        }
        .active{
          font-weight: 700;
        }
      }
    }
    .IStatisticsCoordinationSystem_app_body{
      width: 100%;
      height: 0;
      flex-grow: 2;
      margin: 15px 20px 0 20px;
      background: #FFFFFF;
      border-radius: 10px;
      &>.left{
        width: 400px;
        height: 100%;
        overflow: hidden;
        padding: 15px 15px 0 15px;
        border-right: 1px solid #EAEAEA;
        .ant-empty{
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      &>.right{
        width: calc(100% - 400px);
        height: 100%;
        padding: 17px 22px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: center;
        .right_top{
          width: 100%;
          margin-bottom: 12px;
        }
        .table_descibe{
          margin-bottom: 5px;
          font-size: 14px;
        }
        .table_block{
          height: 0;
          flex-grow: 2;
        }
      }
    }
  }
  
}
</style>
<style lang="scss">
.IStatisticsCoordinationSystem_app_body{
  // .ant-table-wrapper{
  //   height: 100%;
  //   .ant-spin-nested-loading{
  //     height: 100%;
  //     .ant-spin-container{
  //       height: 100%;
  //       .ant-table{
  //         height: 100%;
  //         .ant-table-content{
  //           height: 100%;
  //           .ant-table-scroll{
  //             height: 100%;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}

</style>

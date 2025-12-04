<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IPerformanceEvaluation_app">
    <div v-if="propData?.showHeader" class="IPerformanceEvaluation_app_header" :class="isheaderCollapse ? 'collapse' : ''">
      <div class="title">{{ propData?.title }}</div>
      <div class="bottom flex_between">
        <div v-for="(item,index) in statisticsList" :key="index" class="list">
          <div class="value" :class="item.status == '1' ? 'completed' : ''">{{ getDepartInfoValue(item.value) }}{{ index == statisticsList.length - 1 ? '%' : '' }}</div>
          <div class="label">{{ item.label }}</div>
        </div>
      </div>
    </div>
    <div class="IPerformanceEvaluation_app_main flex_between">
      <div v-if="propData?.showLeft" class="left" :class="isLeftCollapse ? 'collapse' : ''">
        <div class="input_box">
          <a-input v-model="userName" 
            @change="handleSearchUser" 
            placeholder="请输入姓名" 
            allowClear 
          >
            <SvgIcon icon-class="search" slot="prefix" />
          </a-input>
        </div>
        <div class="filter_block flex_start">
          <div @click="handleClickFilter(item)" v-for="(item,index) in filter_list" :key="index" class="list" :class="item.label == filter_active ? 'active' : ''">
            <span class="label">{{ item.label }}：</span>
            <span class="value">{{ item.value }}人</span>
          </div>
        </div>
        <div class="user_block">
          <template v-if="user_list?.length">
            <vue-scroll :ops="scrollOps">
              <div @click="handleClickUser(item)" v-for="(item, index) in user_list" :key="index" class="list flex_between" :class="userId == item.userId ? 'active' : ''">
                <div class="left">{{ item.userName }}</div>
                <div class="right flex_end">
                  <div class="score">{{ item.score }}</div>
                  <div class="status" :class="item.assessmentLevel">{{ item.assessmentLevel }}</div>
                </div>
              </div>
            </vue-scroll>
          </template>
          <template v-else>
            <div class="empty_block flex_center">
              <a-empty />
            </div>
          </template>
        </div>
        <div v-if="status == '1'" class="submit_button">
          <a-button @click="handleScoreSubmit()" type="primary" :loading="scoreSubmitButtonLoading" block>提交</a-button>
        </div>
      </div>
      <div class="right">
        <IPerformanceEvaluationUser 
          :userId="userId"
          :moduleObject="moduleObject"
          :propData="propData"
          @update="update"
        />
        <div @click="handleExpandCollapse('isheaderCollapse')" class="expand_collapse_block_header flex_center" :class="isheaderCollapse ? 'collapse' : ''">
          <span></span>
        </div>
        <div @click="handleExpandCollapse('isLeftCollapse')" class="expand_collapse_block_left flex_center" :class="isLeftCollapse ? 'collapse' : ''">
          <span></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import SvgIcon from '../icons/SvgIcon.vue';
import vuescroll from '../mixins/vueScroll'
import IPerformanceEvaluationUser from "../commonComponents/IPerformanceEvaluationUser.vue"

export default {
  name: 'IPerformanceEvaluation',
  components: {
    SvgIcon,
    IPerformanceEvaluationUser
  },
  mixins: [ vuescroll ],
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        showHeader: true,
        showLeft: true,
        showNotice: false,
        showScoreSubmitButton: true
      },
      statisticsList: [
        {
          value: 'assessmentCycle',
          label: "考核周期",
        },
        {
          value: 'deptName',
          label: "DT负责人",
        },
        {
          value: 'assessmentNum',
          label: "考核总人数",
        },
        {
          value: 'completedNum',
          label: "已考核人数",
        },
        {
          value: 'assessmentProcess',
          label: "当前考核进度",
          status: 1
        }
      ],
      userName: '',
      filter_list: [
        {
          label: 'A',
          value: 0
        },
        {
          label: 'B',
          value: 0
        },
        {
          label: 'C',
          value: 0
        },
        {
          label: 'D',
          value: 0
        },
        {
          label: '未考核',
          value: 0
        }
      ],
      filter_active: '',
      user_list: [ ],
      deptName: '部门',
      departData: {},
      userId: '',
      deptAssessmentId: '',
      scoreSubmitButtonLoading: false,
      status: '', // 1可评分 2只允许查看
      isheaderCollapse: false, // 头部是否折叠
      isLeftCollapse: false, // 左侧是否折叠
    }
  },
  watch: {
    
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
    this.status = IDM.url.queryString('status');
    if(IDM.url.queryString('deptAssessmentId')){
      this.deptAssessmentId = IDM.url.queryString('deptAssessmentId');
    }
    if(this.propData.showHeader && this.propData.showLeft){
      this.getDepartData()
    }
  },
  mounted() {
    let that = this;
  },
  destroyed() {},
  methods:{
    handleExpandCollapse(key) {
      this.$data[key] = !this.$data[key];
    },
    handleScoreSubmit() {
      if(this.propData.clickSubmitFunction?.length) {
        IDM.invokeCustomFunctions.apply(this,[this.propData.clickSubmitFunction,{
          _this: this,
        }])
      }
    },
    handleSearchUser(){
      this.getUserList()
    },
    getDepartInfoValue(key){
      return this.departData[key]
    },
    handleClickUser(item){
      this.userId = item.userId;
    },
    handleClickFilter(item){
      if(this.filter_active == item.label){
        this.filter_active = '';
      } else {
        this.filter_active = item.label;
      }
      this.getUserList()
    },
    update(){
      this.getDepartData(true)
    },
    getDepartData(isUpdate){
      IDM.http.get('/ctrl/deptAssessment/detail',{
        deptAssessmentId: this.deptAssessmentId
      }).then((res) => {
        if ( res.data.code == 200 ) {
          this.departData = res.data.data;
          if(Number(this.departData?.assessmentProcess) == 100){
            this.statisticsList[this.statisticsList.length - 1].status = 1;
          } else {
            this.statisticsList[this.statisticsList.length - 1].status = 0;
          }
          this.getUserList(isUpdate)
          this.getFilterListData(res.data?.data?.userList ?? [])
        } else {
          IDM.message.error(res.data.message)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getFilterListData(userList=[]){
      let number = 0;
      this.filter_list.forEach(item => {
        number = userList.filter(user => {
          if(item.label == '未考核'){
            return !user.assessmentLevel
          } else {
            return user.assessmentLevel == item.label
          }
        })?.length;
        item.value = number ?? 0;
      })
    },
    getUserList(isUpdate){
      const userList = this.departData.userList;
      let result = JSON.parse(JSON.stringify(userList));
      if(this.filter_active){
        if(this.filter_active == '未考核'){
          result = userList.filter(item => !item.assessmentLevel)
        } else {
          result = userList.filter(item => item.assessmentLevel == this.filter_active)
        }
      }
      if(this.userName){
        // 字符串去除空格
        let name = this.userName.trim()
        result = result.filter(item => item.userName.includes(name))
      }
      this.user_list = result ?? []
      if(!isUpdate){
        this.userId = this.user_list?.[0]?.userId;
      }
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
.IPerformanceEvaluation_app{
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  background: #f4f4f4;
  .IPerformanceEvaluation_app_header{
    position: relative;
    margin-bottom: 10px;
    padding: 18px 20px;
    background: white;
    border-radius: 8px;
    &.collapse{
      height: 0;
      padding: 0;
      margin-bottom: 0;
      overflow: hidden;
    }
    &>.title{
      text-align: center;
      font-family: AlibabaPuHuiTi,AlibabaPuHuiTi;
      font-weight: 500;
      font-size: 24px;
      line-height: 24px;
      color: #333;
    }
    &>.bottom{
      margin-top: 18px;
      padding: 11px 0;
      background: rgba(60,141,219,.1);
      border-radius: 8px;
      &>.list{
        width: 20%;
        text-align: center;
        border-right: 1px solid #e5e5e5;
        &:last-child{
          border-right: none;
          .value{
            color: #e12617;
          }
        }
        .value{
          height: 27px;
          font-size: 20px;
          line-height: 27px;
          color: #333;
          font-weight: 500;
          font-family: AlibabaPuHuiTi,AlibabaPuHuiTi;
        }
        .completed{ 
          color: #26b340;
        }
        .label{
          font-size: 14px;
          color: #666;
          line-height: 20px;
          font-family: Alibaba-PuHuiTi,Alibaba-PuHuiTi;
        }
      }
    }
    
  }
  .IPerformanceEvaluation_app_main{
    flex-grow: 2;
    &>.left{
      width: 280px;
      height: 100%;
      display: flex;
      flex-direction: column;
      margin-right: 10px;
      padding: 20px;
      background: white;
      &.collapse{
        width: 0;
        padding: 0;
        margin: 0;
        overflow: hidden;
      }
      .input_box{
        margin-bottom: 14px;
        .ant-input-prefix{
          .svg-icon{
            color: #999;
          }
        }
      }
      .filter_block{
        flex-wrap: wrap;
        .list{
          width: 73px;
          height: 36px;
          margin-bottom: 10px;
          line-height: 36px;
          font-family: Alibaba-PuHuiTi,Alibaba-PuHuiTi;
          font-size: 14px;
          text-align: center;
          color: #333;
          margin-right: 10px;
          background: #f5f7fa;
          border-radius: 4px;
          cursor: pointer;
          &:nth-child(3){
            margin-right: 0;
          }
          &:nth-child(4){
            margin-bottom: 0;
          }
          &:nth-child(5){
            margin-right: 0;
            margin-bottom: 0;
            flex-grow: 2;
          }
          &.active{
            color: white;
            background: #3c8ddb;
          }
        }
      }
      .user_block{
        margin-top: 14px;
        flex-grow: 2;
        height: 0;
        .list{
          height: 50px;
          margin-bottom: 10px;
          line-height: 50px;
          padding: 0 14px;
          background: #f5f7fa;
          border-radius: 3px;
          cursor: pointer;
          box-sizing: border-box;
          &:last-child{
            margin-bottom: 0;
          }
          &.active{
            border: 1px solid #3c8ddb;
          }
          .left{
            font-family: AlibabaPuHuiTi,AlibabaPuHuiTi;
            font-weight: 500;
            color: #333;
            font-size: 16px;
          }
          .right{
            .score{
              font-family: Alibaba-PuHuiTi,Alibaba-PuHuiTi;
              font-size: 14px;
              color: #333;
            }
            .status{
              width: 20px;
              height: 20px;
              margin-left: 10px;
              line-height: 18px;
              text-align: center;
              font-family: AlibabaPuHuiTi,AlibabaPuHuiTi;
              color: white;
              font-weight: 500;
              font-size: 14px;
              border-radius: 4px;
              &.A{
                background: #00ae5f;
              }
              &.B{
                background: #1593f4;
              }
              &.C{
                background: #f77321;
              }
              &.D{
                background: #e83034;
              }
            }
          }
        }
        .empty_block{
          height: 100%;
        }
      }
    }
    &>.right{
      width: 0;
      height: 100%;
      position: relative;
      flex-grow: 2;
      padding: 15px 18px;
      background: white;
      .expand_collapse_block_header{
        width: 55px;
        height: 9px;
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%);
        clip-path: polygon(calc(100% - 10px) 100%, 10px 100%, 0 0, 100% 0);
        background-color: rgba(0,115,202,1);
        overflow: hidden;
        cursor: pointer;
        &.collapse{
          span{
            border-top: 5px solid white;
            border-bottom: none;
          }
        }
        span{
          width: 0;
          height: 0;
          border-left: 5px solid transparent;
          border-right: 5px solid transparent;
          border-bottom: 5px solid white; /* 等边三角形高度 */
          border-top: none;
        }
      }
      .expand_collapse_block_left{
        width: 9px;
        height: 55px;
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(-50%);
        clip-path: polygon(100% 10px, 0 0, 0 100%, 100% calc(100% - 10px));
        background-color: rgba(0,115,202,1);
        overflow: hidden;
        cursor: pointer;
        &.collapse{
          span{
            border-left: 5px solid white;
            border-right: none;
          }
        }
        span{
          width: 0;
          height: 0;
          border-left: none;
          border-right: 5px solid white;
          border-bottom: 5px solid transparent; /* 等边三角形高度 */
          border-top: 5px solid transparent;
        }
      }
    }
  }
}
</style>


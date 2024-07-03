<template>
  <div idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IPaySystem_app">
    <div class="header flex_start">
      <div v-if="isAdmin == '1'" class="form_list flex_start">
        <div class="label">姓名：</div>
        <div class="input_box">
          <a-input v-model="userName" placeholder="请输入" />
        </div>
      </div>
      <div v-if="isAdmin == '1'" class="form_list flex_start">
        <div class="label">部门：</div>
        <div class="input_box">
          <a-input v-model="deptName" placeholder="请输入" />
        </div>
      </div>
      <div class="form_list flex_start">
        <div class="label">开始时间：</div>
        <div class="date_box">
          <a-month-picker v-model="startDate" valueFormat="YYYY-MM" placeholder="请选择月份" />
        </div>
      </div>
      <div class="form_list flex_start">
        <div class="label">结束时间：</div>
        <div class="date_box">
          <a-month-picker v-model="endDate" valueFormat="YYYY-MM" placeholder="请选择月份" />
        </div>
      </div>
      <div class="button_block flex_start">
        <div @click="search()" class="button_box primary">查询</div>
        <div @click="reset()" class="button_box default">重置</div>
      </div>
    </div>
    <div class="main">
      <div class="tab_block flex_between">
        <div @click="handleClickTab" class="left flex_start">
          <div data-value="baseSalaryList" class="button_list" :class="active_tab == 'baseSalaryList' ? 'active' : ''">工资</div>
          <div data-value="subsidySalaryList" class="button_list" :class="active_tab == 'subsidySalaryList' ? 'active' : ''">津补贴</div>
          <div data-value="otherSalaryList" class="button_list" :class="active_tab == 'otherSalaryList' ? 'active' : ''">其他</div>
        </div>
        <div class="right button_block flex_end">
          <div @click="exportData()" v-if="isAdmin != '1'" class="button_box primary">导出明细</div>
          <div @click="exportTemplate()" v-if="isAdmin == '1'" class="button_box primary">模板下载</div>

          <div @click="importFile('baseSalaryList')" v-if="isAdmin == '1'" class="button_box default">导入工资</div>
          <div @click="importFile('subsidySalaryList')" v-if="isAdmin == '1'" class="button_box default">导入津补贴</div>
          <div @click="importFile('otherSalaryList')" v-if="isAdmin == '1'" class="button_box default">导入其他</div>
        </div>
      </div>
      <div class="table">
        <div ref="tableHeader" class="table_header flex_between">
          <template v-for="(item,index) in header_object[active_tab]">
            <div v-if="isAdmin == '1' || (isAdmin != '1' && ['userName','deptName','idNumber'].indexOf(item.key) == '-1')" :key="index" class="cell flex_center">
              <span>{{ item.label }}</span>
            </div>
          </template>
        </div>
        <div ref="tableBody" class="table_body">
          <template v-if="table_data_object[active_tab] && table_data_object[active_tab].length">
            <vue-scroll :ops="scrollOps">
              <div v-for="(item,index) in table_data_object[active_tab]" :key="index" class="row table_body_row flex_between">
                <template v-for="(item1,index1) in header_object[active_tab]">
                  <div v-if="isAdmin == '1' || (isAdmin != '1' && ['userName','deptName','idNumber'].indexOf(item1.key) == '-1')" :key="index1" class="cell flex_center">
                    <template v-if="(item1.key == 'userName' || (item1.key == 'strYear' && isAdmin != '1')) && !item.id">
                      <span>{{ item.id ? item[item1.key] : '合计' }}</span>
                    </template>
                    <template v-else>
                      <span>{{ item[item1.key] }}</span>
                    </template>
                  </div>
                </template>
              </div>
            </vue-scroll>
          </template>
          <template v-else>
            <div class="empty_blcok">
              <a-empty description="暂无数据" />
            </div>
          </template>
          
        </div>
        

      </div>
    </div>
  </div>
</template>
<script>
import locale from 'ant-design-vue/es/date-picker/locale/zh_CN';
import vueScroll from "@/mixins/vueScroll.js";
export default {
  name: "IPaySystem",
  mixins: [vueScroll],
  components: {
  },
  props: {
    
  },
  watch: {
    
  },
  data() {
    return {
      locale,
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        showTotal: true
      },
      isAdmin: '',
      userName: '',
      deptName: '',
      startDate: '',
      endDate: '',
      header_object: {
        'baseSalaryList': [
          {
            key: 'userName',
            label: '人员姓名'
          },
          {
            key: 'deptName',
            label: '部门名称'
          },
          {
            key: 'idNumber',
            label: '身份证号'
          },
          {
            key: 'strYear',
            label: '年度'
          },
          {
            key: 'strMonth',
            label: '月'
          },
          {
            key: 'netPay',
            label: '实发金额'
          },
          {
            key: 'jobSalary',
            label: '职务工资'
          },
          {
            key: 'levelSalary',
            label: '级别工资'
          },
          {
            key: 'commuteAllowance',
            label: '上下班交通费补贴'
          },
          {
            key: 'communicationFee',
            label: '通信费'
          },
          {
            key: 'basicPerformanceBonus',
            label: '基础绩效奖'
          },
          {
            key: 'singleChildFee',
            label: '独生子女费'
          },
          {
            key: 'disciplineInspectionAllowance',
            label: '纪检监察办案人员补贴'
          },
          {
            key: 'otherAdditions',
            label: '其他加项'
          },
          {
            key: 'totalPayable',
            label: '应发合计'
          },
          {
            key: 'pensionFund',
            label: '职业年金'
          },
          {
            key: 'retirementPension',
            label: '养老金'
          },
          {
            key: 'housingFund',
            label: '住房公积金'
          },
          {
            key: 'medicalInsurance',
            label: '医疗保险金'
          },
          {
            key: 'unemploymentInsurance',
            label: '失业保险金'
          },
          {
            key: 'individualIncomeTax',
            label: '个人所得税'
          },
          {
            key: 'unionFee',
            label: '工会费'
          },
          {
            key: 'otherDeductions',
            label: '其他扣项'
          },
          {
            key: 'totalDeductions',
            label: '扣项合计'
          }
        ],
        'subsidySalaryList': [
          {
            key: 'userName',
            label: '人员姓名'
          },
          {
            key: 'deptName',
            label: '部门名称'
          },
          {
            key: 'idNumber',
            label: '身份证号'
          },
          {
            key: 'strYear',
            label: '年度'
          },
          {
            key: 'strMonth',
            label: '月'
          },
          {
            key: 'netPay',
            label: '实发金额'
          },
          {
            key: 'workAllowance',
            label: '工作性津贴'
          },
          {
            key: 'livingAllowance',
            label: '生活性补贴'
          },
          {
            key: 'housingAllowance',
            label: '住房补贴'
          },
          {
            key: 'transportationAllowance',
            label: '公务交通补贴'
          },
          {
            key: 'totalPayable',
            label: '应发合计'
          },
          {
            key: 'otherDeductions',
            label: '其他扣项'
          },
          {
            key: 'pensionFund',
            label: '职业年金'
          },
          {
            key: 'retirementPension',
            label: '养老金'
          },
          {
            key: 'totalDeductions',
            label: '扣项合计'
          },
          {
            key: 'housingFund',
            label: '住房公积金'
          },
          {
            key: 'medicalInsurance',
            label: '医疗保险金'
          },
          {
            key: 'unemploymentInsurance',
            label: '失业保险金'
          },
          {
            key: 'individualIncomeTax',
            label: '个人所得税'
          },
          {
            key: 'unionFee',
            label: '工会费'
          }
        ],
        'otherSalaryList':[
          {
            key: 'userName',
            label: '人员姓名'
          },
          {
            key: 'deptName',
            label: '部门名称'
          },
          {
            key: 'idNumber',
            label: '身份证号'
          },
          {
            key: 'strYear',
            label: '业务年度'
          },
          {
            key: 'strMonth',
            label: '月份'
          },
          {
            key: 'batch',
            label: '月批次数'
          },
          {
            key: 'realSent',
            label: '实发金额'
          },
          {
            key: 'shouldBeSent',
            label: '应发金额'
          },
          {
            key: 'deductions',
            label: '扣项'
          },
          {
            key: 'remark',
            label: '备注'
          }
        ]
      },
      table_data_object: {},
      active_tab: 'baseSalaryList',
    };
  },
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.isAdmin = IDM.url.queryString('isAdmin');
    this.startDate = IDM.dateFormat(new Date().getTime(),"Y-m");
    this.endDate = IDM.dateFormat(new Date().getTime(),"Y-m");
    this.convertAttrToStyleObject();
    this.getTableList()
  },
  mounted() {
    this.adjustTableBodyHeight()
  },
  methods: {
    adjustTableBodyHeight() {
      this.$nextTick(() => {
        if(this.$refs.tableBody && this.$refs.tableHeader) {
          this.$refs.tableBody.style.height = `calc(100% - ${this.$refs.tableHeader.offsetHeight}px)`;
        }
      })
    },
    importFile(type) {
      let input = document.createElement('input')
      input.type = 'file'
      input.accept = '.xlsx'; // 限制选择的文件类型为 .pdf, .png, .zip, .jpg
      input.style.display = 'none'
      document.body.appendChild(input)
      input.click();
      input.onchange = (e) => {
        const file = e.target.files[0] // 获取文件对象
        let paramsFile = new FormData() // 转为表单格式
        paramsFile.append('file',file) // 添加属性和值
        this.importFileApi(type,file,input)
      }
    },
    importFileApi(type,file,dom) {
      let url = '';
      if(type == 'baseSalaryList') {
        url = '/ctrl/czjSalary/baseSalary/import';
      } else if (type == 'subsidySalaryList') {
        url = '/ctrl/czjSalary/subsidySalary/import'
      } else {
        url = '/ctrl/czjSalary/otherSalary/import'
      }
      IDM.http.upload(url, file,{"uploadType":"custom"})
      .then((res) => {
        if(res && res.data && res.data.code == '200') {
          IDM.message.success(res.data.message);
          this.search()
        } else {
          if(res.data && res.data.data && res.data.data.length){
            let message = res.data.data.join(', ');
            IDM.message.error(message);
          } else {
            IDM.message.error(res.data.message);
          }
        }
        document.body.removeChild(dom);
      }).catch((err) => {
        console.log(err);
        document.body.removeChild(dom);
      })
    },
    exportData() {
      let fileName = `工资系统（${this.startDate}-${this.endDate}）.xlsx`;
      IDM.http.get('/ctrl/czjSalary/salary/export',{
        startDate: this.startDate,
        endDate: this.endDate,
      },{
        responseType: "blob",
      }).then((res) => {
        const blob = new Blob([res.data]);
        let url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.setAttribute("target", "_blank");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }).catch((err) => {
        this.$refs[this.moduleObject.id][`exportData_loading`] = false;
        console.log(err)
      })
    },
    exportTemplate() {
      let fileName = `工资系统模板.zip`;
      IDM.http.get('/ctrl/czjSalary/salary/downLoadTemplate',{
        
      },{
        responseType: "blob",
      }).then((res) => {
        const blob = new Blob([res.data]);
        let url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.setAttribute("target", "_blank");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }).catch((err) => {
        this.$refs[this.moduleObject.id][`exportData_loading`] = false;
        console.log(err)
      })
    },
    search() {
      this.getTableList()
    },
    reset() {
      this.startDate = IDM.dateFormat(new Date().getTime(),"Y-m");
      this.endDate = IDM.dateFormat(new Date().getTime(),"Y-m");
      this.userName = '';
      this.deptName = '';
      this.getTableList()
    },
    getTableList() {
      if(this.isAdmin == '1') {
        this.getTableListAdmin()
      } else {
        this.getTableListUser()
      }
    },
    getTableListAdmin() {
      IDM.http.get('/ctrl/czjSalary/salary/admin/query', {
        startDate: this.startDate,
        endDate: this.endDate,
        summaryToList: this.propData.showTotal ? true : false,
        userName: this.userName,
        deptName: this.deptName
      }).then((res) => {
        if(res.data.type == 'success') {
          this.table_data_object = res.data.data;
        }
      }).catch((err) => {
        console.log(err);
      })
    },
    getTableListUser() {
      IDM.http.get('/ctrl/czjSalary/salary/query', {
        startDate: this.startDate,
        endDate: this.endDate,
        summaryToList: this.propData.showTotal ? true : false
      }).then((res) => {
        if(res.data.type == 'success') {
          this.table_data_object = res.data.data;
        }
      }).catch((err) => {
        console.log(err);
      })
    },
    handleClickTab(e) {
      this.active_tab = e.target.dataset.value;
      this.adjustTableBodyHeight()
    },
    handleClickAgendaItem(item) {
      this.propData.agendaClickFunction && this.propData.agendaClickFunction.length && IDM.invokeCustomFunctions.apply(this,[this.propData.agendaClickFunction,{
        item: item,
        _this: this
      }])
    },
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
              IDM.style.setBoxStyle(styleObject, element)
              break;
            case "bgImgUrl":
              styleObject["background-image"]=`url(${window.IDM.url.getWebPath(element)})`;
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
              IDM.style.setBorderStyle(styleObject, element)
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id,styleObject);
    },
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.convertAttrToStyleObject();
    },
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
    receiveBroadcastMessage(object){
      console.log("组件收到消息",object)
    },
    sendBroadcastMessage(object){
        window.IDM.broadcast&&window.IDM.broadcast.send(object);
    },
    setContextValue(object) {
      console.log("统一接口设置的值", object);
    }
  }
};
</script>
<style lang="scss" scoped>
.IPaySystem_app {
  height: calc(100vh - 80px);
  &>.header{
    height: 60px;
    margin-bottom: 12px;
    padding: 0 20px;
    background: #FFFFFF;
    box-shadow: 0px 2px 4px 0px rgba(222,225,234,0.5);
    .form_list{
      margin-right: 20px;
      &:last-child{
        margin-right: 0;
      }
      .input_box{
        width: 170px;
        flex-shrink: 0;
      }
      .label{
        white-space: nowrap;
        font-size: 16px;
        color: #333333;
      }
    }
    .button_block{
      .button_box{
        width: 70px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        color: white;
        font-size: 16px;
        border-radius: 4px;
        cursor: pointer;
        &:nth-child(1){
          margin-right: 20px;
          background: #2D8CF0;
        }
        &:nth-child(2){
          background: #999999;
        }
      }
    }
  }
  &>.main{
    height: calc(100% - 72px);
    padding: 16px 20px;
    background: white;
    .tab_block{
      margin-bottom: 10px;
      &>.left{
        // height: 28px;
        border: 1px solid #2D8CF0;
        border-radius: 4px;
        .button_list{
          width: 70px;
          height: 30px;
          line-height: 30px;
          text-align: center;
          color: #2D8CF0;
          font-size: 16px;
          cursor: pointer;
          border-left: 1px solid #2D8CF0;
          &:nth-child(1){
            border-left: none;
          }
          &.active{
            color: white;
            background: #2D8CF0;
          }
        }
      }
      &>.right{
        .button_box{
          height: 30px;
          line-height: 30px;
          margin-left: 15px;
          padding: 0 13px;
          color: white;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
        }
        .primary{
          background: #2D8CF0;
        }
        .default{
          background: #999999;
        }
      }
    }
  }
  .table {
    height: calc(100% - 42px);
    .table_header {
      // height: 48px;
      padding-right: 8px;
      align-items: stretch;
      text-align: center;
      background: #f9fcfe;
      border-top: 1px solid rgba(230, 230, 230, 1);
      border-right: 1px solid rgba(230, 230, 230, 1);
      border-bottom: 1px solid rgba(230, 230, 230, 1);
      .cell {
        width: 100%;
        // height: 100%;
        // line-height: 48px;
        flex-grow: 2;
        flex-shrink: 1;
        // align-items: stretch;
        box-sizing: border-box;
        padding: 10px 12px;
        font-size: 16px;
        color: #333333;
        letter-spacing: 0;
        font-weight: 500;
        border-left: 1px solid rgba(230, 230, 230, 1);
        // overflow: hidden;

      }
    }
    .table_body {
      height: calc(100% - 48px);
      .table_body_row {
        padding-right: 8px;
        align-items: stretch;
        border-bottom: 1px solid rgba(230, 230, 230, 1);
        border-right: 1px solid rgba(230, 230, 230, 1);
        .cell {
          width: 100%;
          position: relative;
          flex-grow: 2;
          flex-shrink: 1;
          box-sizing: border-box;
          padding: 12px 12px 12px 12px;
          word-break: break-all;
          font-size: 14px;
          text-align: center;
          border-left: 1px solid rgba(230, 230, 230, 1);
        }
      }
    }
  }
  .empty_blcok{
    padding: 100px 0;
    border: 1px solid #e6e6e6;
    border-top: none;
  }
}
</style>
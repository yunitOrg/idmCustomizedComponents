<template>
  <div class="IPerformanceEvaluationUser_app">
    <template v-if="currentUserId">
      <div class="IPerformanceEvaluationUser_app_header">
        <div class="user_info flex_between">
          <div class="left flex_start">
            <img :src="getImageSrc('', 'defaultHeader')" style="width: 40px; height: 40px;" alt="" />
            <span class="name">{{ resultData?.userName }}</span>
            <span class="label">{{ resultData?.jobSerialText }}</span>
            <span v-if="!userId" class="date">{{ resultData?.assessmentCycle }}</span>
            <a-button @click="handleClickWorkHour()" class="button">工时详情</a-button>
            <a-button @click="handleClickAttendance()" class="button">考勤详情</a-button>
          </div>
          <div v-if="!(userId && resultData.submitStatus == '1')" class="right">
            <div class="confirm_status">
              <a-tag :color="resultData.confirmStatus == '2' ? 'green' : 'orange'">
                {{  resultData?.confirmStatusText }}
              </a-tag>
            </div>
          </div>
        </div>
        <div class="notice_block">
          <a-icon type="exclamation-circle" theme="filled" />
          <span class="text">9.5分（不含）以上为A档，该项不得高于20%；9分（含）-9.5分（含）为B档；8分（含）-9分（不含）为C档；低于8分（不含）为D档</span>
        </div>
      </div>
      <div class="table_block">
        <a-table :columns="tableColumn" 
          :data-source="tableListData" 
          bordered
          :pagination="false"
          :scroll="scroll"
          rowKey="itemId"
          :loading="loading"
        />
      </div>
      <div class="IPerformanceEvaluationUser_app_footer ">
        <div v-if="attendanceDeductionShow || workingHoursDeductionShow" class="flex_end radio_block">
          <div v-if="workingHoursDeductionShow" class="list flex_end">
            <div class="flex_start" style="margin-right: 15px;">
              <span>漏填天数：</span>
              <span>{{ workingHoursDeductionNumberActual }}</span>
            </div>
            <div class="flex_start" style="margin-right: 15px;">
              <span>工时实际扣款天数：</span>
              <template>
                <div v-if="status == '1' && ifEdit != '-1'" class="input_box">
                  <a-input v-model="workingHoursDeductionNumber" allowClear />
                </div>
                <div v-else>{{ workingHoursDeductionNumber }}</div>
              </template>
            </div>
            <div class="flex_start">
              <span>工时实际扣款金额：</span>
              <span style="color: #e63026;font-weight: 600;margin-right: 5px;">{{ workingHoursDeductionAmount }}</span>
              <span>元</span>
            </div>
          </div>
          <div v-if="attendanceDeductionShow" class="list flex_end">
            <div class="flex_start" style="margin-right: 15px;">
              <span>缺勤天数：</span>
              <span>{{ attendanceDeductionNumberActual }}</span>
            </div>
            <div class="flex_start">
              <span>考勤实际扣款天数：</span>
              <template>
                <div v-if="status == '1' && ifEdit != '-1'" class="input_box">
                  <a-input v-model="attendanceDeductionNumber" allowClear />
                </div>
                <div v-else>{{ attendanceDeductionNumber }}</div>
              </template>
            </div>
          </div>
        </div>
        <div v-if="!((!resultData.remark) && !(status == '1' && ifEdit != '-1'))" class="row remark flex_start">
          <div style="white-space: nowrap;">备注：</div>
          <div v-if="status == '1' && ifEdit != '-1'" class="input_box" style="width: 100%;">
            <a-textarea v-model="remark" placeholder="请输入备注" allowClear></a-textarea>
          </div>
          <div v-else v-html="resultData.remark"></div>
        </div>
        
        <div class="row flex_between">
          <div class="left flex_start">
            <div class="score">
              当前总分：<span>{{ totalScore }}</span>
            </div>
            <div class="grade">
              考核等级：<span>{{ levelText ? levelText : '未考核' }}</span>
            </div>
          </div>
          <div v-if="status == '1' && ifEdit != '-1'" class="right">
            <a-button @click="makeScoreByLastMonth" type="primary" style="margin-right: 10px;">按上月得分进行赋分</a-button>
            <a-button @click="handleSave" type="primary" :loading="saveLoading">保存</a-button>
          </div>
          <div v-else-if="isShowStatusConfirm == 'true' && resultData?.confirmStatus == '1'" class="right">
            <a-button @click="handleConfirm" :loading="confirmLoading" type="primary">
              确认
            </a-button>
          </div>
        </div>
      </div>
    </template>
    <template v-else> 
      <div class="empty_block flex_center">
        <a-empty />
      </div>
    </template>
    <!-- 考勤详情模块、工时详情模块 -->
    <a-modal 
      v-model="showAttendanceDetailPop" 
      :title="statisticType == 'attendance' ? '考勤详情' : '工时详情'" 
      :destroyOnClose="true" 
      :maskClosable="false"
      width="1200px" 
      :footer="null"
      @cancel="handleCancelAttendanceDetailPop"
      wrapClassName="AttendanceWorkHourDetailPop"
    >
      <AttendanceWorkHourDetail 
        :deptAssessmentId="deptAssessmentId"
        :currentUserId="currentUserId"
        :yearMonth="resultData?.assessmentCycle"
        :statisticType="statisticType"
      />
    </a-modal>
  </div>
</template>
<script>
import AttendanceWorkHourDetail from "@/commonComponents/AttendanceWorkHourDetail"
export default {
  name: 'IPerformanceEvaluationUser',
  components: {
    AttendanceWorkHourDetail,
  },
  props: {
    userId: {
      type: String,
      default: ''
    },
    moduleObject: {
      type: Object,
      default: () => {}
    },
    propData: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      tableList: [ ],
      tableListData: [],
      remark: '',
      tableColumn: [
        {
          title: '考核指标',
          dataIndex: 'indicatorName',
          key: 'indicatorName',
          width: 140,
          align: "center",
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            obj.attrs.rowSpan = row.row || 0;
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              return {
                children: <div class="user_notice_info">
                  <div class="left">{this.resultData?.userName}，您好！</div>
                  <div class="left">您{this.resultData?.assessmentCycle}的绩效评分为{this.totalScore}分，请您确认该考核结果。如有异议，请您在今天下午18点之前反馈至DT负责人，如无反馈，刚视为对该考核结果无异议。</div>
                  <div class="right">我已知悉绩效分数并确认该考核结果</div>
                  <div class="right">
                    <img src={this.getImageSrc(`${this.resultData?.signPhoto}`)} alt="" />
                  </div>
                </div>,
                attrs: {
                  colSpan: 8,
                },
              };
            } else {
              return {
                children: value,
                attrs: {
                  rowSpan: obj.attrs.rowSpan,
                },
              }
            }
          },
        },
        {
          title: 'KPI',
          dataIndex: 'itemName',
          key: 'itemName',
          align: "center",
          width: 150,
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              obj.attrs.colSpan = 0;
            } else {
              obj.attrs.colSpan = 1;
            }
            return obj;
          }
        },
        {
          title: '指标说明',
          dataIndex: 'assessmentStandard',
          key: 'assessmentStandard',
          align: "center",
          customRender: (value, row, index) => {
            const h = this.$createElement;
            const obj = {
              children: value,
              attrs: {},
            };
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              obj.attrs.colSpan = 0;
              obj.children = null;
            } else {
              obj.attrs.colSpan = 1;
              obj.children = h('div', {
                style: { textAlign: 'left' },
                domProps: {
                  innerHTML: value
                }
              })
            }
            return obj;
          }
        },
        {
          title: '权重',
          dataIndex: 'weight',
          key: 'weight',
          width: 100,
          align: "center",
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              obj.attrs.colSpan = 0;
              obj.children = null;
            } else {
              obj.attrs.colSpan = 1;
              obj.children = <span>{ value ? value : '-' }{ value ? '%' : '' }</span>
            }
            return obj;
          }
        },
        {
          title: '分值',
          dataIndex: 'maxScore',
          key: 'maxScore',
          align: "center",
          width: 100,
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              obj.attrs.colSpan = 0;
            } else {
              obj.attrs.colSpan = 1;
            }
            return obj;
          }
        },
        {
          title: '上月得分',
          dataIndex: 'lastMonthScore',
          key: 'lastMonthScore',
          align: "center",
          width: 100,
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              obj.attrs.colSpan = 0;
            } else {
              obj.attrs.colSpan = 1;
            }
            return obj;
          }
        },
        {
          title: '得分',
          dataIndex: 'score',
          key: 'score',
          width: 140,
          align: "center",
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              obj.attrs.colSpan = 0;
              obj.children = null
            } else {
              obj.attrs.colSpan = 1;
              if(this.status == '1' && this.ifEdit != '-1') {
                if(row.maxScore && parseInt(row.maxScore) == -10) {
                  obj.children = <div>{value}</div>
                } else {
                  obj.children = <div class="input_box"> 
                    <input
                      value={row.score}
                      min={0}
                      max={row.maxScore}
                      type="number" 
                      step={0.1}
                      onInput={(e) => this.handleInput(row, index, e, 'score')}
                      placeholder="输入分数"
                      class="input_number"
                      onWheel={(e) => e.preventDefault()}
                    />
                  </div>
                }
              } else { 
                obj.children = <div>{value}</div>
              }
            }
            return obj;
          }
        },
        {
          title: '备注',
          dataIndex: 'remark',
          key: 'remark',
          width: 140,
          align: "center",
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            if(index == this.tableListData.length - 1 && this.isPersonal == 'true' && this.propData.showNotice) {
              obj.attrs.colSpan = 0;
              obj.children = null
            } else {
              obj.attrs.colSpan = 1;
              if(this.status == '1' && this.ifEdit != '-1') {
                obj.children = <div class="input_box"> 
                  <input
                    value={row.remark}
                    type="text" 
                    onInput={(e) => this.handleInput(row, index, e, 'remark')}
                    placeholder="输入备注"
                    class="input_number"
                  />
                </div>
              } else { 
                obj.children = <div>{value}</div>
              }
            }
            return obj;
          }
        }
      ],
      scroll: {
        y: "calc(100% - 58px)"
      },
      totalScore: 0,
      levelText: '',
      level: '',
      loading: false,
      status: '', // 1可评分 2只允许查看
      assessmentLevelList: [],
      deptAssessmentId: '',
      currentUserId: '',
      saveLoading: false,
      // 返回数据
      resultData: {},
      // 查看本人考核绩效-确认功能
      isShowStatusConfirm: '',
      confirmLoading: false,
      // 是否是个人查看页面
      isPersonal: undefined,
      // 考勤详情
      showAttendanceDetailPop: false,
      statisticType: '',
      // 工时是否扣款
      workingHoursDeductionShow: false,
      workingHoursDeductionNumber: "",
      workingHoursDeductionNumberActual: "",
      deductList: [
        {label: '是', value: "1"},
        {label: '否', value: "0"}
      ],
      // 考勤是否扣款
      attendanceDeductionShow: false,
      attendanceDeductionNumber: "",
      attendanceDeductionNumberActual: "",
      ifEdit: '', // 1允许编辑，-1不允许编辑。需要叠加status进行判断，status=1 && ifEdit=1时，允许编辑，其他情况不允许编辑
    }
  },
  computed: {
    // 获取工时实际扣款金额
    workingHoursDeductionAmount() {
      if(this.workingHoursDeductionNumber) {
        let num = parseInt(Number(this.workingHoursDeductionNumber) * 50)
        if(Number.isNaN(num)) {
          return 0
        } else {
          return num
        }
      } else {
        return 0
      }
    },
  },
  watch: { 
    userId: {
      handler (val) {
        this.currentUserId = val;
        this.getUserData()
      }
    }
  },
  created () {
    this.status = IDM.url.queryString('status');
    this.deptAssessmentId = IDM.url.queryString('deptAssessmentId')
    this.isShowStatusConfirm = IDM.url.queryString('isShowStatusConfirm')
    this.isPersonal = IDM.url.queryString('isPersonal')
    if(IDM.url.queryString('userId')){
      this.currentUserId = IDM.url.queryString('userId');
      this.getUserData()
    }
  },
  mounted () {
    
  },
  methods: {
    makeScoreByLastMonth() {
      console.log('makeScoreByLastMonth', this.tableListData)
      const that = this
      this.$confirm({
        title: '提示',
        content: h => <div style="color:red;">
          按照上月得分进行评分并保存，是否确定？
        </div>,
        onOk() {
          that.makeScoreByLastMonthSubmit()
        },
        onCancel() {
          console.log('Cancel');
        },
      });
      
    },
    makeScoreByLastMonthSubmit() { 
      if(this.tableListData?.length > 0) { 
        this.tableListData.forEach(item => { 
          if(item.lastMonthScore) { 
            item.score = item.lastMonthScore;
          }
        })
      }
      this.getTotalScore()
      this.handleSave()
    },
    handleClickWorkHour() {
      this.statisticType = 'kpiHours';
      this.showAttendanceDetailPop = true;
    },
    handleClickAttendance() {
      this.statisticType = 'attendance';
      this.showAttendanceDetailPop = true;
    },
    handleCancelAttendanceDetailPop() {
      this.showAttendanceDetailPop = false;
      this.statisticType = '';
    },
    handleConfirm(){
      const that = this
      this.$confirm({
        title: '提示',
        content: h => <div style="color:red;">
          确认当前评分，是否确定？
        </div>,
        onOk() {
          that.handleConfirmSubmit()
        },
        onCancel() {
          console.log('Cancel');
        },
      });
    },
    handleConfirmSubmit(){ 
      this.confirmLoading = true;
      IDM.http.get('/ctrl/indicator/confirmStatus',{
        deptAssessmentId: this.deptAssessmentId,
        userId: this.currentUserId
      }).then((res) => {
        this.confirmLoading = false;
        if ( res.data.code == 200 ) {
          IDM.message.success(res.data.message)
          this.getUserData()
          this.$emit("update")
        } else {
          IDM.message.error(res.data.message)
        }
      }).catch((err) => {
        this.loading = false;
        this.confirmLoading = false;
        console.log(err)
      })
    },
    handleSave(){
      console.log('handleSave', this.tableList)
      let isScoreEmpty = false;
      this.tableList.forEach(item => {
        if((item.itemId == "260813143152lLpq1IdJNjfymEHVA1U" || item.itemId == '260813143152DOiXcx5qcL1qzIGj1ZO') && (!item.score || Number(item.score) == 0)){
          isScoreEmpty = true;
        }
      })
      if(isScoreEmpty){
        IDM.message.error('请填写评分！')
        return
      }
      if(parseInt(this.attendanceDeductionNumberActual) && this.attendanceDeductionNumber != this.attendanceDeductionNumberActual && !this.remark) {
        IDM.message.error('考勤实际扣款天数和系统统计不一致时需要填写备注原因！！！')
        return
      }
      if(parseInt(this.workingHoursDeductionNumberActual) && this.workingHoursDeductionNumber != this.workingHoursDeductionNumberActual && (!this.remark) && !Number.isNaN(Number(this.workingHoursDeductionNumber))) {
        IDM.message.error('工时实际扣款天数和系统统计不一致时需要填写备注原因！！！')
        return
      }
      let params = {
        totalScore: this.totalScore,
        userId: this.currentUserId,
        level: this.level,
        levelText: this.levelText,
        deptAssessmentId: this.deptAssessmentId,
        indicatorList: this.tableList,
        remark: this.remark,
        actDedWorkDay: this.workingHoursDeductionNumber,
        actDedDays: this.attendanceDeductionNumber
      }
      console.log(params)
      this.saveLoading = true;
      IDM.http.post('/ctrl/deptAssessment/save', {
        ...params
      },{
        headers: {
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        this.saveLoading = false;
        if(res.data.type == 'success'){
          IDM.message.success('保存成功')
          this.getUserData()
          this.$emit("update")
        } else {
          IDM.message.error(res.data.message)
        }
      }).catch((error) => {
        this.saveLoading = false;
        console.log(error)
      })
    },
    getTotalScore(){
      let tableList = JSON.parse(JSON.stringify(this.tableList));
      let totalScore = 0;
      tableList.forEach(item => {
        if(item.weight){
          totalScore = totalScore + (Number(item.score) / Number(item.maxScore)) * item.scoreType * Number(item.weight) / 100;
        } else {
          if(item.score){
            totalScore = totalScore + Number(item.score);
          }
        }
      });
      console.log('totalScore',totalScore)
      this.totalScore = (Math.round(totalScore*100)/100).toFixed(2);
      this.getGradeText(Number(this.totalScore))
    },
    getGradeText(score){
      if(!score){
        this.levelText = 'D';
        this.level = 4;
        return
      }
      this.assessmentLevelList.forEach((item,index) => {
        if((index === 0 && score > item.minScore) || (index == 1 && score >= item.minScore && score <= item.maxScore) || (index == 2 && score >= item.minScore && score < item.maxScore) || (index == 3 && score < item.maxScore)){
          this.levelText = item.scoreLevelText;
          this.level = item.scoreLevel;
        }
      })
    },
    handleInput(item, index, e, key){
      console.log(item, index)
      console.log(e.target.value)
      if(key == 'score') {
        if(e.target.value > Number(item.maxScore)){
          item.score = item.maxScore
        } else if(e.target.value < 0){
          item.score = 0
        } else {
          item.score = e.target.value;
        }
        this.getTotalScore()
      } else {
        item[key] = e.target.value;
      }
    },
    handleChange(item, index, e){
      console.log(item, index)
      console.log(e)
    },
    getUserData(){
      if(this.currentUserId && this.deptAssessmentId){
        this.loading = true;
        IDM.http.get('/ctrl/indicator/loadByUserId',{
          deptAssessmentId: this.deptAssessmentId,
          userId: this.currentUserId,
          status: this.status
        }).then((res) => {
          this.loading = false;
          if ( res.data.code == 200 ) {
            this.tableList = res.data.data.indicatorList ?? [];
            this.totalScore = res.data.data.totalScore || 0;
            this.levelText = res.data.data.levelText ?? '';
            this.level = res.data.data.level;
            this.assessmentLevelList = res.data.data.assessmentLevelList ?? [];
            this.resultData = res.data.data;
            this.remark = res.data.data.remark;
            this.ifEdit = res.data.data.ifEdit;

            if(this.isPersonal == 'true' && this.propData.showNotice) {
              let tableList = JSON.parse(JSON.stringify(this.tableList));
              tableList.push({
                id: 'customer'
              })
              this.tableListData = tableList;
            } else {
              this.tableListData = this.tableList;
            }
            this.getTotalScore()
            this.getWorkHoursAndAttendance("kpiHours")
            this.getWorkHoursAndAttendance("attendance")
            this.$nextTick(() => {
              this.getTotalScore()
            })
          } else {
            IDM.message.error(res.data.message)
          }
        }).catch((err) => {
          this.loading = false;
          console.log(err)
        })
      } 
      
    },
    // 获取工时详情和考勤详情
    getWorkHoursAndAttendance(type){
      this.attendanceDeductionShow = false;
      this.workingHoursDeductionShow = false;
      IDM.http.get('/ctrl/erpAssessmentUser/getStatisticInfo',{
        deptAssessmentId: this.deptAssessmentId,
        statisticType: type,
        userId: this.currentUserId,
        yearMonth: this.resultData?.assessmentCycle ? this.resultData?.assessmentCycle.replace('年', '-').replace('月', '') : ''
      }).then((res) => {
        if ( res.data.code == 200 ) {
          if(type == "kpiHours") {
            this.workingHoursDeductionNumberActual = res.data.data.itemList[1]?.value;
            if(res.data.data.itemList[4].value && parseInt(res.data.data.itemList[4].value) > 0 || Number.isNaN(parseInt(res.data.data.itemList[4].value))) {
              this.workingHoursDeductionShow = true;
              this.workingHoursDeductionNumber = res.data.data.itemList[4].value;
            } else {
              this.workingHoursDeductionShow = false;
              this.workingHoursDeductionNumber = 0;
            }
          } else {
            this.attendanceDeductionNumberActual = res.data.data.itemList[3]?.value;
            if(res.data.data.itemList[5].value && parseInt(res.data.data.itemList[5].value) > 0 || Number.isNaN(parseInt(res.data.data.itemList[5].value))) {
              this.attendanceDeductionShow = true;
              this.attendanceDeductionNumber = res.data.data.itemList[5].value;
            } else {
              this.attendanceDeductionShow = false;
              this.attendanceDeductionNumber = 0;
            }
          }
        } else {
          IDM.message.error(res.data.message)
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    getImageSrc(url,name) {
      if ( url ) {
        return IDM.url.getWebPath(url)
      } else {
        return IDM.url.getModuleAssetsWebPath(require(`../assets/${name}.png`),this.moduleObject)
      }
    },
  }
}
</script>
<style lang="scss" scoped>
.IPerformanceEvaluationUser_app {
  height: 100%;
  display: flex;
  flex-direction: column;
  .IPerformanceEvaluationUser_app_header{
    margin-bottom: 14px;
    .user_info{
      &>.left{
        img{
          width: 40px;
          height: 40px;
        }
        .name{
          font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
          font-weight: 500;
          font-size: 18px;
          color: #262f35;
          line-height: 25px;
          margin-left: 10px;
        }
        .label{
          padding: 4px;
          border-radius: 2px;
          border: 1px solid;
          border-color: #3c8ddb;
          font-family: PingFangSC, PingFang SC;
          font-weight: 500;
          font-size: 14px;
          color: #3c8ddb;
          line-height: 14px;
          margin-left: 10px;
        }
        .date{
          margin-left: 10px;
          font-family: PingFangSC, PingFang SC;
          font-size: 14px;
        }
        .button{
          margin-left: 10px;
        }
      }
      &>.right{
        font-family: PingFangSC, PingFang SC;
        font-weight: 400;
        font-size: 14px;
        color: #3c8ddb;
        line-height: 20px;
        cursor: pointer;
      }
    }
    .notice_block{
      margin-top: 10px;
      background: rgba(247, 115, 33, .1);
      border-radius: 4px;
      padding: 8px 11px;
      color: #f77321;
      font-size: 14px;
      .text{
        margin-left: 5px;
        font-family: Alibaba-PuHuiTi, Alibaba-PuHuiTi;
        font-weight: normal;
        line-height: 20px;
      }
    }
  }
  .table_block{
    height: 0;
    flex-grow: 1;
  }
  .IPerformanceEvaluationUser_app_footer{
    margin-top: 15px;
    &>.row{
      &>.left{
        font-family: AlibabaPuHuiTi, AlibabaPuHuiTi;
        font-weight: 400;
        font-size: 14px;
        color: #262f35;
        .score{
          margin-right: 20px;
        }
        span{
          color: #e63026;
          margin: 0 3px;
          font-weight: 600;
          font-size: 18px;
        }
      }
    }
    .remark{
      margin-bottom: 5px;
      .input_box{
        flex-grow: 2;
        width: 0;
      }
    }
    .radio_block{
      margin-bottom: 5px;
      &>.list{
        margin-left: 70px;
      }
      .input_box{
        width: 100px;
        :deep(.ant-input){
          width: 100% !important;
        }
      }
    }
  }
  .empty_block{
    height: 100%;
  }
}
</style>
<style lang="scss">
.IPerformanceEvaluationUser_app{
  .ant-table-wrapper{
    height: 100%;
    .ant-spin-nested-loading{
      height: 100%;
      .ant-spin-container{
        height: 100%;
        .ant-table{
          height: 100%;
          .ant-table-content{
            height: 100%;
            .ant-table-scroll{
              height: 100%;
            }
          }
        }
      }
    }
  }
  .input_box{
    input{
      width: 100px;
      padding: 8px 10px;
      border: 1px solid #d9d9d9;
      border-radius: 4px;
      &:focus{
        border: 1px solid #d9d9d9;
        outline: none;
      }
    }
  }
  .user_notice_info{
    img{
      height: 40px;
      text-align: right;
    }
    .left{
      text-align: left;
    }
    .right{
      text-align: right;
    }
  }
}

</style>
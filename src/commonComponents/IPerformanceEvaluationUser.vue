<template>
  <div class="IPerformanceEvaluationUser_app">
    <template v-if="currentUserId">
      <div class="header">
        <div class="user_info flex_between">
          <div class="left flex_start">
            <img :src="getImageSrc('', 'defaultHeader')" alt="" />
            <span class="name">{{ resultData?.userName }}</span>
            <span class="label">{{ resultData?.jobSerialText }}</span>
          </div>
          <!-- <div class="right">
            历史考核结果
          </div> -->
        </div>
        <div class="notice_block">
          <a-icon type="exclamation-circle" theme="filled" />
          <span class="text">9.5分（不含）以上为A档，该项不得高于20%；9分（含）-9.5分（含）为B档；8分（含）-9分（不含）为C档；低于8分（不含）为D档</span>
        </div>
      </div>
      <div class="table_block">
        <a-table :columns="tableColumn" 
          :data-source="tableList" 
          bordered
          :pagination="false"
          :scroll="scroll"
          rowKey="itemId"
          :loading="loading"
        >
          <template slot="weight" slot-scope="text">
            <span>{{ text ? text : '-' }}{{ text ? '%' : '' }}</span>
          </template>
          <template slot="score" slot-scope="text, record, index">
            <div v-if="status == '1'" class="input_box">
              <input
                v-model="record.score"
                :min="0" 
                :max="record.maxScore" 
                type="number" 
                :step="0.1"
                @input="e => handleInput(record, index, e)"
                @change="e => handleChange(record, index, e)" 
                placeholder="输入分数"
                class="input_number"
                @wheel.prevent
              />
            </div>
            <span v-else>{{ text }}</span>
          </template>
        </a-table>
      </div>
      <div class="footer flex_between">
        <div class="left flex_start">
          <div class="score">
            当前总分：<span>{{ totalScore }}</span>
          </div>
          <div class="grade">
            考核等级：<span>{{ levelText ? levelText : '未考核' }}</span>
          </div>
        </div>
        <div v-if="status == '1'" class="right">
          <a-button @click="handleSave" type="primary">保存</a-button>
        </div>
      </div>
    </template>
    <template v-else> 
      <div class="empty_block flex_center">
        <a-empty />
      </div>
    </template>
  </div>
</template>
<script>
export default {
  name: 'IPerformanceEvaluationUser',
  props: {
    userId: {
      type: String,
      default: ''
    },
    moduleObject: {
      type: Object,
      default: () => {}
    }
  },

  data () {
    return {
      tableList: [ ],
      tableColumn: [
        {
          title: '考核指标',
          dataIndex: 'indicatorName',
          key: 'indicatorName',
          width: 140,
          customRender: (value, row, index) => {
            const obj = {
              children: value,
              attrs: {},
            };
            obj.attrs.rowSpan = row.row || 0;
            return obj;
          },
        },
        {
          title: 'KPI',
          dataIndex: 'itemName',
          key: 'itemName',
          width: 150
        },
        {
          title: '指标说明',
          dataIndex: 'assessmentStandard',
          key: 'assessmentStandard',
        },
        {
          title: '权重',
          dataIndex: 'weight',
          key: 'weight',
          width: 100,
          scopedSlots: { customRender: 'weight' }
        },
        {
          title: '分值',
          dataIndex: 'maxScore',
          key: 'maxScore',
          width: 100
        },
        {
          title: '得分',
          dataIndex: 'score',
          key: 'score',
          width: 140,
          scopedSlots: { customRender: 'score' }
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
      // 返回数据
      resultData: {},
    }
  },
  watch: { 
    userId: {
      handler (val) {
        this.currentUserId = val;
        this.getUserData()
      }
    },
    totalScore: {
      handler (val) {
        this.getGradeText(val ? Number(val) : 0)
      }
    }
  },
  created () {
    this.status = IDM.url.queryString('status');
    this.deptAssessmentId = IDM.url.queryString('deptAssessmentId')
    if(IDM.url.queryString('userId')){
      this.currentUserId = IDM.url.queryString('userId');
      this.getUserData()
    }
  },
  mounted () {
    
  },
  methods: {
    handleSave(){
      let params = {
        totalScore: this.totalScore,
        userId: this.currentUserId,
        level: this.level,
        levelText: this.levelText,
        deptAssessmentId: this.deptAssessmentId,
        indicatorList: this.tableList
      }
      console.log(params)
      IDM.http.post('/ctrl/deptAssessment/save', {
        ...params
      },{
        headers: {
          'Content-Type': 'application/json',
        }
      }).then((res) => {
        IDM.message.success('保存成功')
        this.getUserData()
      }).catch((error) => {
        console.log(error)
      })
    },
    getTotalScore(){
      let tableList = JSON.parse(JSON.stringify(this.tableList));
      let totalScore = 0;
      tableList.forEach(item => {
        if(item.weight){
          totalScore = totalScore + Math.round(item.score * parseInt(item.weight));
        } else {
          if(item.score){
            totalScore = totalScore + item.score * 100;
          }
        }
      });
      this.totalScore = (totalScore/100).toFixed(2);
    },
    getGradeText(score){
      if(!score){
        this.levelText = '';
        return
      }
      this.assessmentLevelList.forEach((item,index) => {
        if((index === 0 && score > item.minScore) || (index == 1 && score >= item.minScore && score <= item.maxScore) || (index == 2 && score >= item.minScore && score < item.maxScore) || (index == 3 && score < item.maxScore)){
          this.levelText = item.scoreLevelText;
          this.level = item.scoreLevel;
        }
      })
    },
    handleInput(item, index, e){
      console.log(item, index)
      console.log(e.target.value)
      if(e.target.value > parseInt(item.maxScore)){
        item.score = item.maxScore
      }
      if(e.target.value < 0){
        item.score = 0
      }
      this.getTotalScore()
    },
    handleChange(item, index, e){
      console.log(item, index)
      console.log(e)
    },
    getUserData(){
      if(this.currentUserId && this.deptAssessmentId){
        this.loading = true
        IDM.http.get('/ctrl/indicator/loadByUserId',{
          deptAssessmentId: this.deptAssessmentId,
          userId: this.currentUserId
        }).then((res) => {
          this.loading = false;
          if ( res.data.code == 200 ) {
            this.tableList = res.data.data.indicatorList ?? [];
            this.totalScore = res.data.data.totalScore || 0;
            this.levelText = res.data.data.levelText ?? '';
            this.assessmentLevelList = res.data.data.assessmentLevelList ?? [];
            this.resultData = res.data.data;
          } else {
            IDM.message.error(res.data.message)
          }
        }).catch((err) => {
          this.loading = false;
          console.log(err)
        })
      } 
      
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
  &>.header{
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
  &>.footer{
    margin-top: 15px;
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
}

</style>
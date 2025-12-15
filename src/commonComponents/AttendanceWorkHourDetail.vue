<template>
  <div class="AttendanceDetail_app">
    <div class="statistics_block">
      <div class="title">{{ statisticType == 'kpiHours' ? '工时' : '考勤' }}统计</div>
      <div class="main">
        <div v-for="item in statistics_list" :key="item.name" class="list">
          <div class="name">{{ item.name }}</div>
          <div class="value">
            <span class="number">{{ item.value }}</span>
            <span class="unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="table_block">
      <div v-for="(item, index) in subTableList" :key="index" class="table_item">
        <div class="title">
          {{ item.tableTitle }}
        </div>
        <div class="main">
          <a-table 
            :columns="getTableColumns(item.tableColumns)" 
            :data-source="item.tableList" 
            bordered 
            :pagination="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  export default {
    name: 'AttendanceWorkHourDetail',
    props: {
      yearMonth: {
        type: String,
        default: ''
      },
      currentUserId: {
        type: String,
        default: ''
      },
      statisticType: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        statistics_list: [],
        subTableList: []
      }
    },
    created() {
      this.getInitData()
    },
    methods: {
      getTableColumns(columns) {
        return columns.map(item => {
          return {
            ...item,
            dataIndex: item.key
          }
        })
      },
      getInitData() {
        IDM.http.get('/ctrl/erpAssessmentUser/getStatisticInfo',{
          statisticType: this.statisticType,
          userId: this.currentUserId,
          yearMonth: this.yearMonth ? this.yearMonth.replace('年', '-').replace('月', '') : ''
        }).then((res) => {
          this.confirmLoading = false;
          if ( res.data.code == 200 ) {
            this.statistics_list = res.data.data.itemList;
            this.subTableList = res.data.data.subTableList;
          } else {
            IDM.message.error(res.data.message)
          }
        }).catch((err) => {
          console.log(err)
        })
      }
    }
  }
</script>
<style lang="scss" scoped>
.AttendanceDetail_app{
  .statistics_block{
    margin-bottom: 20px;
    .title{
      font-size: 16px;
      font-weight: 600;
      color: #333333;
      margin-bottom: 10px;
    }
    .main{
      display: grid;
      grid-auto-flow: column; /* 横向排列 */
      grid-auto-columns: 1fr; /* 所有列等宽 */
      gap: 0 20px;
      .list{
        padding: 15px 20px;
        background: white;
        border: 1px solid rgb(230, 230, 230);
        box-shadow: 0 2px 12px rgba(0, 0, 0, .07);
        border-radius: 4px;
        .name{
          font-size: 14px;
          color: #333333;
          font-weight: 600;
        }
        .value{
          .number{
            margin-right: 3px;
            font-size: 18px;
            font-weight: 700;
          }
        }
      }
    }
  }
  .table_block{
    .table_item{
      margin-bottom: 20px;
      &:last-child{
        margin-bottom: 0;
      }
      .title{
        font-size: 16px;
        font-weight: 600;
        color: #333333;
        margin-bottom: 10px;
      }
    }
  }
}
</style>
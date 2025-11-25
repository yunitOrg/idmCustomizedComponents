<template>
  <div class="unit-schedule">
    <div class="op">
      <a-space>
        <div style="display: flex; align-items: center">
          <span>姓名：</span
          ><a-input v-model="searchVal" style="width: 180px" placeholder="请输入姓名" />
        </div>
        <a-button type="primary" @click="handleSearch"> 查询 </a-button>
        <a-button @click="handlePrevWeek"> 上一周 </a-button>
        <a-button @click="handleCurrentWeek"> 当前周 </a-button>
        <a-button @click="handleNextWeek"> 下一周 </a-button>
        <a-button type="primary" @click="handleWeekView"> 周视图 </a-button>
      </a-space>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      bordered
      :customRow="customRow"
    >
    </a-table>
  </div>
</template>
<script>
import dayjs from "dayjs";
import travelScheduleData from "@/mock/ITravelSchedule";
const { unitSchedule } = travelScheduleData;
export default {
  name: "UnitSchedule",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      columns: [
        {
          title: "部门/单位",
          dataIndex: "unit",
          key: "unit",
          align: "center",
          customRender: (value, row, index) => {
            return {
              children: value,
              attrs: {
                rowSpan: row.rowSpan,
              },
            };
          },
        },
        {
          title: "姓名",
          dataIndex: "name",
          key: "name",
          align: "center",
        },
      ],
      dataSource: [],
      nowDate: dayjs().format("YYYY-MM-DD"),
      weeks: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      searchVal:""
    };
  },
  props: {},
  created() {
    this.renderDate();
  },
  methods: {
    handleWeekView() {
      this.$emit("changeViewType","week");
    },
    handleSearch() {
      this.initData();
    },
    handlePrevWeek() {
      this.nowDate = dayjs(this.nowDate).subtract(1, "week").format("YYYY-MM-DD");
      this.renderDate();
    },
    handleCurrentWeek() {
      this.nowDate = dayjs().format("YYYY-MM-DD");
      this.renderDate();
    },
    handleNextWeek() {
      this.nowDate = dayjs(this.nowDate).add(1, "week").format("YYYY-MM-DD");
      this.renderDate();
    },
    customRow(record, index) {
      return {
        style: {
          "background-color": record.bgc,
        },
      };
    },
    renderDate() {
      this.columns.splice(2);
      const nowDate = dayjs(this.nowDate).format("YYYY-MM-DD");
      const weekStart = dayjs(nowDate).startOf("iosweek");
      for (let i = 0; i < 7; i++) {
        const date = dayjs(weekStart).add(i, "day").format("YYYY-MM-DD");
        const isWeekend = i === 5 || i === 6; // 周六(5)和周日(6)
        
        this.columns.push({
          title: `${date}（${this.weeks[i]}）`,
          dataIndex: date,
          key: date,
          children: [
            {
              title: "上午",
              dataIndex: `${date}-morning`,
              key: `${date}-morning`,
              align: "center",
              customRender: (text, record, index) => {
                return {
                  children: text,
                  attrs: {
                    class: isWeekend ? 'weekend-cell' : ''
                  }
                };
              }
            },
            {
              title: "下午",
              dataIndex: `${date}-afternoon`,
              key: `${date}-afternoon`,
              align: "center",
              customRender: (text, record, index) => {
                return {
                  children: text,
                  attrs: {
                    class: isWeekend ? 'weekend-cell' : ''
                  }
                };
              }
            },
          ],
        });
      }

      this.initData();
    },
    initData() {
      const res = unitSchedule;
      this.dataSource = [];
      let bgc = "#fff";
      res.forEach((unit) => {
        unit.forEach((emp, index) => {
          this.dataSource.push({
            ...emp,
            rowSpan: index === 0 ? unit.length : 0,
            bgc,
          });
        });
        bgc = bgc === "#fff" ? "#f2f2f2" : "#fff";
      });
      console.log(this.dataSource);
    },
  },
};
</script>
<style scoped lang="scss">
.unit-schedule {
  .op {
    padding: 14px 0;
    display: flex;
    flex-direction: row-reverse;
  }

  ::v-deep {
    .ant-table-thead > tr > th {
      background-color: #cce8eb75;
    }
    
    // 确保周末单元格样式生效
    .weekend-cell {
      background-color: #87ceeb !important;
      color: #fff !important;
    }
  }
}
</style>
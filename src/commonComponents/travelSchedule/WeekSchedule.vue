<template>
  <div class="unit-schedule">
    <div class="op">
      <a-space>
        <a-button @click="handleReturn" type="primary"> 返回 </a-button>
        <a-button @click="handlePrevWeek"> 上一周 </a-button>
        <a-button @click="handleCurrentWeek"> 当前周 </a-button>
        <a-button @click="handleNextWeek"> 下一周 </a-button>
        <a-button type="primary" @click="handleApply"> 请假 </a-button>
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
const { workContent } = travelScheduleData;
export default {
  name: "UnitSchedule",
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {},
      columns: [
        {
          title: "时间",
          dataIndex: "date",
          key: "date",
          align: "center",
          colSpan: 2,
          customRender: (value, row, index) => {
            return {
              children: (
                <div>
                  <div>{row.date}</div>
                  <div>{row.weekStr}</div>
                </div>
              ),
              attrs: {
                rowSpan: row.rowSpan,
              },
            };
          },
          width: 260,
        },
        {
          title: "上午下午",
          dataIndex: "time",
          key: "time",
          align: "center",
          colSpan: 0,
          width: 150,
        },
        {
          title: "工作内容",
          dataIndex: "workContent",
          key: "workContent",
          align: "center",
          customRender: (value, row, index) => {
            const isWeekend =
              row.weekStr === "星期六" || row.weekStr === "星期日"; // 周六(5)和周日(6)
            return {
              children: value,
              attrs: {
                class: isWeekend ? "weekend-cell" : "",
              },
            };
          },
        },
      ],
      dataSource: [],
      nowDate: dayjs().format("YYYY-MM-DD"),
      weeks: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      searchVal: "",
    };
  },
  props: {},
  created() {
    this.renderDate();
  },
  methods: {
    handleReturn() {
      this.$emit("changeViewType", "unit");
    },
    handleApply() {},
    handlePrevWeek() {
      this.nowDate = dayjs(this.nowDate)
        .subtract(1, "week")
        .format("YYYY-MM-DD");
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
      const nowDate = dayjs(this.nowDate).format("YYYY-MM-DD");
      const weekStart = dayjs(nowDate).startOf("iosweek");
      for (let i = 0; i < 7; i++) {
        const date = dayjs(weekStart).add(i, "day").format("YYYY-MM-DD");
        const isWeekend = i === 5 || i === 6; // 周六(5)和周日(6)

        // this.columns.push({
        //   title: `${date}（${this.weeks[i]}）`,
        //   dataIndex: date,
        //   key: date,
        //   children: [
        //     {
        //       title: "上午",
        //       dataIndex: `${date}-morning`,
        //       key: `${date}-morning`,
        //       align: "center",
        //       customRender: (text, record, index) => {
        //         return {
        //           children: text,
        //           attrs: {
        //             class: isWeekend ? 'weekend-cell' : ''
        //           }
        //         };
        //       }
        //     },
        //     {
        //       title: "下午",
        //       dataIndex: `${date}-afternoon`,
        //       key: `${date}-afternoon`,
        //       align: "center",
        //       customRender: (text, record, index) => {
        //         return {
        //           children: text,
        //           attrs: {
        //             class: isWeekend ? 'weekend-cell' : ''
        //           }
        //         };
        //       }
        //     },
        //   ],
        // });
      }

      this.initData();
    },
    initData() {
      const res = workContent;
      this.dataSource = [];
      let bgc = "#fff";
      res.forEach((item, index) => {
        this.dataSource.push({
          date: item.date,
          weekStr: item.weekStr,
          workContent: item.morningWorkContent,
          time: "上午",
          rowSpan: 2,
          bgc,
        });
        this.dataSource.push({
          date: item.date,
          weekStr: item.weekStr,
          workContent: item.afternoonWorkContent,
          time: "下午",
          rowSpan: 0,
          bgc,
        });
        bgc = bgc === "#fff" ? "#f2f2f2" : "#fff";
      });
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
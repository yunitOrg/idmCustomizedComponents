const unitSchedule =

// 行程安排
// 参数：
// searchVal：”张三“ 
// startDate：”2025-11-24“
// endDate：”2025-11-30“
{
  code: 200,

  data: {
    title: "中国西电集团本部部门负责人2025年第47周出行情况",  // 标题
    list: [
      // 每个部门/单位是一个集合
      [
        {
          unit: '公司领导', // 部门或者领导
          name: '张三1', // 姓名
          '2025-11-24-morning': '本单位', // 周一上午
          '2025-11-24-afternoon': '本单位', // 周一下午
        },
        {
          unit: '公司领导',
          name: '张三2',
          '2025-11-24-morning': '本单位',
          '2025-11-24-afternoon': '本单位',
        },
        {
          unit: '公司领导',
          name: '张3',
          '2025-11-24-morning': '本单位',
          '2025-11-24-afternoon': '本单位',
        },
      ],
      [
        {
          unit: '财务部',
          name: '李四',
          '2025-11-24-morning': '本单位',
          '2025-11-24-afternoon': '本单位',
        }
      ],
      [
        {
          unit: '战略发展部',
          name: '王五1',
          '2025-11-24-morning': '本单位',
          '2025-11-24-afternoon': '本单位',
        },
        {
          unit: '战略发展部',
          name: '王五2',
          '2025-11-24-morning': '本单位',
          '2025-11-24-afternoon': '本单位',
        },
        {
          unit: '战略发展部',
          name: '王五3',
          '2025-11-24-morning': '本单位',
          '2025-11-24-afternoon': '本单位',
        }
      ]

    ]
  }
}

const workContent = 
// 个人行程安排
// 参数：
// startDate：”2025-11-24“
// endDate：”2025-11-30“
{
  code: 200,
  data: [
    {
      date: '2025-11-24', 
      weekStr: "星期一",
      morningWorkContent: '本单位',
      afternoonWorkContent: '本单位',
    },
    {
      date: '2025-11-25',
      weekStr: "星期二",
      morningWorkContent: '本单位',
      afternoonWorkContent: '本单位',
    },
    {
      date: '2025-11-26',
      weekStr: "星期三",
      morningWorkContent: '本单位',
      afternoonWorkContent: '本单位',
    },
    {
      date: '2025-11-29',
      weekStr: "星期六",
      morningWorkContent: '公休',
      afternoonWorkContent: '公休',
    },
  ]
}

export default {
  unitSchedule,
  workContent
}

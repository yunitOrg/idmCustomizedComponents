import vuescroll from 'vuescroll'
import Vue from 'vue';

// 在这里设置全局配置
Vue.use(vuescroll, {
  ops: {
    mode: 'native',
    bar: {
      showDelay: 500,
      onlyShowBarOnScroll: false,//是否只有滚动的时候才显示滚动条
      keepShow: true,
      background: 'rgb(3, 185, 118)',
      opacity: 0.2,
      hoverStyle: false,
      specifyBorderRadius: false,
      minSize: false,
      size: '6px',
      disable: false,
      'overflow-x': 'hidden',
    }
  }, // 在这里设置全局默认配置
  name: 'vueScroll' // 在这里自定义组件名字，默认是vueScroll
});
export default {
  data() {
    return {
      scrollOps: {
        scrollPanel: {
            scrollingX: false
        },
        bar: {
            background: '#ccc'
        },
        vuescroll: {
            wheelScrollDuration: 100
        }
      }
    }
  }
}
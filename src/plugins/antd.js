// 按需加载 ant-design-vue
// 手动删除没用用过的组件
import Vue from 'vue'
// import 'ant-design-vue/lib/button/style/css'
// import 'ant-design-vue/lib/empty/style/css'
// import 'ant-design-vue/lib/icon/style/css'
// import 'ant-design-vue/lib/popover/style/css';
// import 'ant-design-vue/lib/progress/style/css';
// import 'ant-design-vue/lib/slider/style/css';
// import 'ant-design-vue/lib/select/style/css';

// import Base from 'ant-design-vue/lib/base/index.js';
import { Button, Popover, Progress,Slider,Empty,Select,Input,DatePicker, TreeSelect,
  Table,
  Space,
  Modal,
  ConfigProvider,
  message,
  Icon,
  InputNumber
} from 'ant-design-vue'

/* v1.1.3+ registration methods */
// Vue.use(Base)
Vue.use(Button)
Vue.use(Popover)
Vue.use(Progress)
Vue.use(Slider)
Vue.use(Empty)
Vue.use(Select)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(DatePicker)
Vue.use(TreeSelect)
Vue.use(Table)
Vue.use(Space)
Vue.use(Modal)
Vue.use(ConfigProvider)
Vue.use(message)
Vue.use(Icon)
Vue.prototype.$confirm = Modal.confirm

// 按需加载 ant-design-vue
// 手动删除没用用过的组件
import Vue from 'vue'
import 'ant-design-vue/lib/breadcrumb/style/css'
import 'ant-design-vue/lib/row/style/css'
import 'ant-design-vue/lib/col/style/css'
import 'ant-design-vue/lib/modal/style/css'
import 'ant-design-vue/lib/input/style/css'
import 'ant-design-vue/lib/button/style/css'
import 'ant-design-vue/lib/spin/style/css'
import 'ant-design-vue/lib/empty/style/css'
import 'ant-design-vue/lib/icon/style/css'
import 'ant-design-vue/lib/pagination/style/css'
import 'ant-design-vue/lib/date-picker/style/css'
import 'ant-design-vue/lib/popover/style/css';
import 'ant-design-vue/lib/tooltip/style/css';
import 'ant-design-vue/lib/tabs/style/css';
import 'ant-design-vue/lib/progress/style/css';

import Base from 'ant-design-vue/lib/base/index.js';
import { Button, Popover, Progress } from 'ant-design-vue'

/* v1.1.3+ registration methods */
Vue.use(Base)
Vue.use(Button)
Vue.use(Popover)
Vue.use(Progress)

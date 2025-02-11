<template>
<div class="ITreeItem_app">
  <div v-for="(item,index) in tree_data" :key="index">
    <div @click="clickNode(item)" class="header flex_between" :class="item.id == active_item.active ? 'active' : ''">
      <div class="header_left flex_start">
        <div @click.stop="clickIcon(item)" class="icon" :class="item.showChildren ? 'open' : 'close'">
          <template v-if="item.level == 1">
            <div class="img_box">
              <img src="@/assets/level1Open.png" alt="">
            </div>
          </template>
          <template v-else-if="item.level == 2">
            <span v-if="item.showChildren" class="open icon_block">
              <SvgIcon icon-class="open"></SvgIcon>
            </span>
            <span v-else class="close icon_block">
              <SvgIcon icon-class="close"></SvgIcon>
            </span>
          </template>
          <template v-else-if="item.level == 3">
            <div class="square"></div>
          </template>
        </div>
        <div class="text" :class="getTreeTitleClassName(item)">{{ item['bt'] }}</div>
      </div>
    </div>
    <div v-if="item.children && item.children.length && item.showChildren" class="main">
      <ITreeItem :tree_data="item.children" :active_item="active_item"></ITreeItem>
    </div>
  </div>
</div>
</template>

<script>
import SvgIcon from '../icons/SvgIcon.vue';
import adaptationScreenMixin from '../mixins/adaptationScreen'

export default {
  name: 'ITreeItem',
  props: ['tree_data', 'active_item'],
  components: {
    SvgIcon
  },
  watch: {
    
  },
  mixins: [adaptationScreenMixin],
  data() {
    return {

    }
  },
  created() {
  },
  methods: {
    clickIcon(item) {
      this.$set(item, 'showChildren', item.showChildren ? false : true)
      // if (item.children && item.children.length) {
      // } else {
      //   item.showChildren = false;
      // }
    },
    clickNode(item) {
      console.log('点击节点', item)
      this.active_item.active = item.id;
      // if (item.children && item.children.length) {
      //   item.showChildren = !item.showChildren;
      // } else {
      //   item.showChildren = false;
      // }
    },
    getTreeTitleClassName(item) {
      switch (item.level) {
        case 1:
          return 'title1';
        case 2:
          return 'title2';
        case 3:
          return 'title3'
        default:
          return '';
      }
    },
  }
}
</script>

<style lang="scss" scoped>
.ITreeItem_app {
  height: 100%;
  overflow: auto;
  .main {
    padding-left: 20px;
  }

  .header {
    height: 50px;
    padding: 0 8px 0 8px;
    .icon {
      display: inline-block;
      margin-right: 10px;
      cursor: pointer;
      .svg-icon {
        font-size: 18px;
      }

      .idm_filed_svg_icon {
        width: 12px;
        height: 12px;
        fill: currentColor;
      }

      .icon_block {
        display: inline-block;
        width: 12px;
        height: 12px;
      }
      .img_box{
        width: 17px;
        height: 17px;
        img{
          width: 17px;
          height: 17px;
          display: block;
        }
      }
      .square{
        width: 6px;
        height: 6px;
        transform: rotate(45deg);
        background: #D8D8D8;
      }
    }
    .close{
      .img_box{
        transform: rotate(-90deg);
      }
    }
    .header_left {
      width: calc(100% - 35px);

      .text {
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
      }
      .title1{
        font-family: AlibabaPuHuiTi-Bold;
        font-size: 16px;
        color: #333333;
        font-weight: 700;
      }
      .title2{
        font-family: AlibabaPuHuiTi-Regular;
        font-size: 16px;
        color: #333333;
        font-weight: 400;
      }
      .title3{
        font-family: AlibabaPuHuiTi-Regular;
        font-size: 16px;
        color: #666666;
        font-weight: 400;
      }
    }
  }
  .active{
    background: #F2F2F2;
    border-radius: 4px;;
  }
  .header_border {
    border-bottom: 1px solid rgba(229, 229, 229, 1);
  }
}
</style>

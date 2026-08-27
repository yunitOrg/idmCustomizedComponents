<template>
  <div class="UserViolationList_app">
    <div class="message">
      {{ message }}
    </div>
    <div class="table_block">
      <a-table 
        :columns="tableColumn" 
        :data-source="tableListData" 
        bordered
        :pagination="false"
        rowKey="userName"
      />
    </div>
  </div>
</template>
<script>
  export default {
    name: 'UserViolationList',
    props: {
      tableListData: {
        type: Array,
        default: () => [],
      },
      message: {
        type: String,
        default: '',
      },
    },
    data() {
      return {
        tableColumn: [
          {
            title: '序号',
            dataIndex: 'index',
            key: 'index',
            width: 80,
            customRender: (text, record, index) => {
              return index + 1
            }
          },
          {
            title: '姓名',
            dataIndex: 'userName',
            key: 'userName',
            width: 130,
          },
          {
            title: '违规内容',
            dataIndex: 'mess',
            key: 'mess',
            customRender: (text) => {
              return this.renderMessageList(text)
            }
          },
        ],
        scroll: {
          y: "calc(100% - 0px)"
        },
      }
    },
    methods: {
      renderMessageList(message) {
        const messageList = String(message || '')
          .split('@')
          .map(item => item.trim())
          .filter(Boolean)

        if (!messageList.length) return '-'

        return this.$createElement(
          'div',
          { class: 'violation-message-list' },
          messageList.map((item, index) => this.$createElement(
            'div',
            { key: index, class: 'violation-message-item' },
            item
          ))
        )
      },
      // 关闭弹窗
      handleCancel() {
        this.$emit('close')
      },
    },
  }
</script>
<style lang="scss" scoped>
.UserViolationList_app{
  height: 100%;
  .message{
    margin-bottom: 10px;
  }
  .violation-message-item{
    white-space: normal;
    word-break: break-all;
  }
}
</style>


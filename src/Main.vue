<template>
  <a-config-provider :locale="locale">
    <component :is="`${componentName}`" @hook:mounted="handleComponentMounted" :ref="`${componentName}`"/>
  </a-config-provider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';
export default {
  name: 'Main',
  components: {
    
  },
  data(){
    return {
      locale: zhCN,
      componentName: this.$root.componentName
    }
  },
  props: {
    
  },
  created() {
    if ( process.env.NODE_ENV == "development" ) {
      this.login()
    }
  },
  mounted() {
    //这里需要把属性传递，并且把组件注册到核心框架提供的方法，然后这里接收固定的平台提供的几个方法，从而实现双向绑定刷新
    // alert(`${process.env.CodeVar}`)
    this.componentName = this.$root.componentName;
    console.log(this.componentName)

  },
  methods: {
    login() {
      IDM.http.get('/ctrl/studiesCenterSubmit/login',{
        
      }).then((res) => {
          if ( res.data.code == 200 ) {
              console.log('登录成功')
          } else {
              IDM.message.error(res.data.message)
          }
      }).catch((err) => {
          console.log(err)
      })
      
    },
    handleComponentMounted(){
      const that = this;
      this.$refs[this.componentName].$nextTick(()=>{
        that.$root.moduleObject.mountComplete && that.$root.moduleObject.mountComplete(that.$root.moduleObject);
      })
    }
  }
}
</script>

<style lang="scss">
@import './styles/flex.scss';
</style>

<template>
  <div v-if="moduleObject?.env != 'production' || !loginStatus" idm-ctrl="idm_module" :id="moduleObject.id" :idm-ctrl-id="moduleObject.id" class="IAirControlLogin_app">
    <div class="title">{{ propData.title || '用户登录' }}</div>
    <div class="form_block flex_center">
      <div class="form_item flex_start">
        <label>用户名</label>
        <input type="text" v-model="moduleObject.username" placeholder="">
      </div>
      <div class="form_item flex_start">
        <label>密码</label>
        <input type="password" v-model="moduleObject.password"  placeholder="">
      </div>
      <div class="form_item form_code flex_start">
        <label>验证码</label>
        <input type="text" v-model="moduleObject.code"  placeholder="">
        <img v-if="codeUrl" :src="getImageSrc(`${codeUrl}`)" @click="handleClickCode()" class="code" alt="">
      </div>
      <div class="button_box">
        <el-button @click="handleSubmit()" type="primary" :loading="loading">登录</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { Button } from "element-ui"
export default {
  name: 'IAirControlLogin',
  components: {
    [Button.name]: Button
  },
  data(){
    return {
      moduleObject:{},
      propData:this.$root.propData.compositeAttr||{
        loadDataCreated: true
      },
      codeUrl: '',
      formData: {
        username: '',
        password: '',
        code: '',
      },
      loading: false,
      loginStatus: false,
    }
  },
  watch: {
    
  },
  props: {
  },
  created() {
    this.moduleObject = this.$root.moduleObject
    this.convertAttrToStyleObject();
    this.handleClickCode()
    this.getLoginStatus()
  },
  mounted() {
    let that = this;
  },
  destroyed() {},
  methods:{
    getLoginStatus() {
      const userInfo = IDM.user.getCurrentUserInfo()
      if(userInfo?.username) {
        this.loginStatus = true
      } else {
        this.loginStatus = false
      }
    },
    handleSubmit() {
      this.loading = true;
      if(this.propData.loginCustomFunction?.length) {
        IDM.invokeCustomFunctions.apply(this, [this.propData.loginCustomFunction, {
          _this: this,
          formData: this.formData
        }])
      }
    },
    handleClickCode() {
      if(this.propData.getCodeCustomFunction?.length) {
        const results = IDM.invokeCustomFunctions.apply(this, [this.propData.getCodeCustomFunction])
        if(results?.length){
          this.codeUrl = results[0];
        }
      } else {
        IDM.http.get('/ctrl/util/genVerifyCodeKey',{
        }).then((res) => {
          if ( res.data.code == 200 ) {
            this.codeUrl = res.data.message;
          } else {
            IDM.message.error(res.data.message)
          }
        }).catch((err) => {
          console.log(err)
        })
      }
    },
    getImageSrc(url,name) {
      if ( url ) {
        return IDM.url.getWebPath(`/ctrl/util/genVerifyCode?key=${url}`)
      } else {
        return IDM.url.getModuleAssetsWebPath(require(`../assets/${name}.png`),this.moduleObject)
      }
    },
    makeParamsData(data) {
        let result = {};
        if ( this.propData.paramsMakeFunction && this.propData.paramsMakeFunction.length && window[this.propData.paramsMakeFunction[0].name] ) {
            result = window[this.propData.paramsMakeFunction[0].name].call(this, {
                                    ...data,
                                    ...this.propData.paramsMakeFunction[0].param,
                                    moduleObject: this.moduleObject,
                                    _this: this
                                });
            console.log('自定义参数函数',result)
            return result
        }
        return data
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData){
      this.propData = propData.compositeAttr||{};
      this.number = this.propData.numberCount ? this.propData.numberCount : 6;
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject(){
      var styleObject = {};
      if(this.propData.bgSize&&this.propData.bgSize=="custom"){
        styleObject["background-size"]=(this.propData.bgSizeWidth?this.propData.bgSizeWidth.inputVal+this.propData.bgSizeWidth.selectVal:"auto")+" "+(this.propData.bgSizeHeight?this.propData.bgSizeHeight.inputVal+this.propData.bgSizeHeight.selectVal:"auto")
      }else if(this.propData.bgSize){
        styleObject["background-size"]=this.propData.bgSize;
      }
      if(this.propData.positionX&&this.propData.positionX.inputVal){
        styleObject["background-position-x"]=this.propData.positionX.inputVal+this.propData.positionX.selectVal;
      }
      if(this.propData.positionY&&this.propData.positionY.inputVal){
        styleObject["background-position-y"]=this.propData.positionY.inputVal+this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if(!element&&element!==false&&element!=0){
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key]=element;
              break;
            case "bgColor":
              if(element&&element.hex8){
                styleObject["background-color"]=element.hex8;
              }
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject,element)
              break;
            case "bgImgUrl":
              styleObject["background-image"]=`url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移
              
              break;
            case "positionY":
              //背景纵向偏移
              
              break;
            case "bgRepeat":
              //平铺模式
                styleObject["background-repeat"]=element;
              break;
            case "bgAttachment":
              //背景模式
                styleObject["background-attachment"]=element;
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject,element)
              break;
            case "font":
              IDM.style.setFontStyle(styleObject,element)
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id,styleObject);
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam(){
      let urlObject = IDM.url.queryObject();
      var params = {
        pageId:
          window.IDM.broadcast && window.IDM.broadcast.pageModule
            ? window.IDM.broadcast.pageModule.id
            : "",
        urlData: JSON.stringify(urlObject),
      };
      return params;
    },

    /**
     * 通用的获取表达式匹配后的结果
     */
    getExpressData(dataName,dataFiled,resultData){
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if(dataFiled){
        var filedExp = dataFiled;
        filedExp =
          dataName +
          (filedExp.startsWiths("[") ? "" : ".") +
          filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      //对结果进行再次函数自定义
      if(this.propData.customFunction&&this.propData.customFunction.length>0){
        var params = this.commonParam();
        var resValue = "";
        try {
          resValue = window[this.propData.customFunction[0].name]&&window[this.propData.customFunction[0].name].call(this,{
            ...params,
            ...this.propData.customFunction[0].param,
            moduleObject:this.moduleObject,
            expressData:_defaultVal,interfaceData:resultData
          });
        } catch (error) {
        }
        _defaultVal = resValue;
      }
      
      return _defaultVal;
    },
    /**
     * 组件通信：接收消息的方法
     * @param {
     *  type:"发送消息的时候定义的类型，这里可以自己用来要具体做什么，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）"
     *  message:{发送的时候传输的消息对象数据}
     *  messageKey:"消息数据的key值，代表数据类型是什么，常用于表单交互上，比如通过这个key判断是什么数据"
     *  isAcross:如果为true则代表发送来源是其他页面的组件，默认为false
     * } object 
     */
    receiveBroadcastMessage(object){
      console.log("组件收到消息",object)
      if (object.type && object.type == "linkageResult") {
        let data_list = [];
        if (Array.isArray(object.message)) {
          data_list = object.message;
        } else if (object.message) {
          data_list = object.message[ this.propData.listData ? this.propData.listData : "list" ];
        }
        this.music_list = data_list;
        this.music_index = 0;
        this.music_url = this.music_list[this.music_index] ? this.music_list[this.music_index].music : '';
      }
    },
    /**
     * 组件通信：发送消息的方法
     * @param {
     *  type:"自己定义的，统一规定的type：linkageResult（组件联动传结果值）、linkageDemand（组件联动传需求值）、linkageReload（联动组件重新加载）
     * 、linkageOpenDialog（打开弹窗）、linkageCloseDialog（关闭弹窗）、linkageShowModule（显示组件）、linkageHideModule（隐藏组件）、linkageResetDefaultValue（重置默认值）",
     *  message:{实际的消息对象},
     *  rangeModule:"为空发送给全部，根据配置的属性中设定的值（值的内容是组件的packageid数组），不取子表的，比如直接 this.$root.propData.compositeAttr["attrKey"]（注意attrKey是属性中定义的bindKey）,这里的格式为：['1','2']"",
     *  className:"指定的组件类型，比如只给待办组件发送，然后再去过滤上面的值"
     *  globalSend:如果为true则全站发送消息，注意全站rangeModule是无效的，只有className才有效，默认为false
     * } object 
     */
    sendBroadcastMessage(object){
        window.IDM.broadcast&&window.IDM.broadcast.send(object);
    },
    /**
     * 交互功能：设置组件的上下文内容值
     * @param {
     *  type:"定义的类型，已知类型：pageCommonInterface（页面统一接口返回值）、"
     *  key:"数据key标识，页面每个接口设置的数据集名称，方便识别获取自己需要的数据"
     *  data:"数据集，内容为：字符串 or 数组 or 对象"
     * }
     */
    setContextValue(object) {
      console.log("统一接口设置的值", object);
    }
  }
}
</script>
<style lang="scss" scoped>
.IAirControlLogin_app{
  height: 98px;
  text-align: center;
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-image: url("../assets/loginbg.png");
  &>.title{
    padding: 6px 0;
    text-align: center;
    font-family: AlibabaPuHuiTi-Bold;
    font-size: 16px;
    line-height: 22px;
    color: white;
    font-weight: 700;
  }
  .form_block{
    padding: 8px 0 0 0;
    .form_item{
      width: 260px;
      height: 40px;
      margin: 0 10px;
      padding: 0 8px 0 0;
      background: #FFFFFF;
      border: 1px solid rgba(220,220,220,1);
      border-radius: 5px;
      label{
        width: 75px;
        flex-shrink: 0;
        flex-grow: 0;
        white-space: nowrap;
        font-family: AlibabaPuHuiTi-Regular;
        font-size: 14px;
        color: #666666;
        font-weight: 400;
        text-align: center;
        border-right: 1px solid #C8C8C8;
      }
      input{
        width: 100%;
        margin-left: 12px;
        border: none;
        outline: none;
        font-size: 14px;
      }
    }
    .form_code{
      .code{
        width: 80px;
        height: 32px;
        cursor: pointer;
      }
    }
    .button_box{
      width: 260px;
      margin: 0 10px;
      cursor: pointer;
      .el-button{
        width: 100%;
        padding: 10px 20px;
        font-family: AlibabaPuHuiTi-Regular;
        font-size: 14px;
        background-color: #4F87F3;
        border-color: #4F87F3;
      }
    }
  }
  
}
</style>


<template>
  <!-- 树+列表 -->
  <div
    idm-ctrl="idm_module"
    :id="moduleObject.id"
    :idm-ctrl-id="moduleObject.id"
    class="ITree"
  >
    <div class="tree-main">
      <div class="left">
        <div class="title">
          <div class="name">
            <i class="layui-icon layui-icon-app"></i>
            <span>{{ treeTitle }}</span>
          </div>
        </div>
        <div class="search">
          <input
            type="text"
            id="searchInput"
            v-model="searchValue"
            @keyup.enter="initData"
          />
          <div class="search-span" id="searchInputIcon" @click="initData">
            <i class="layui-icon layui-icon-search"></i>
          </div>
        </div>
        <div class="ztree">
          <ul id="treeDemo"></ul>
        </div>
      </div>
      <div class="right">
        <iframe
          frameborder="0"
          id="ksiframe"
          class="subiframe"
          name="info"
          width="100%"
          height="100%"
          src=""
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import "../assets/layui/css/layui.css";
import "../assets/ztree/jquery_zTreeStyle.css";
import "../assets/ztree/metroStyle.css";
// import $ from "jquery";
import ztree from "../assets/ztree/js/jquery.ztree.core.js";
Vue.use(ztree);
import ztreeSimple from "../assets/ztree/js/simple.ztree.js";
Vue.use(ztreeSimple);
var setting = {
  data: {
    simpleData: {
      enable: true, //设置是否启用简单数据格式（zTree支持标准数据格式跟简单数据格式，上面例子中是标准数据格式）
      idKey: "id", //设置启用简单数据格式时id对应的属性名称
      pidKey: "pId", //设置启用简单数据格式时parentId对应的属性名称,ztree根据id及pid层级关系构建树结构
    },
  },
  view: {
    nameIsHTML: true,
    showLine: true,
    dblClick: false,
  },
  callback: {
    onClick: nodeEvents, //点击节点执行的方法
  },
};
export default {
  name: "ITree",
  components: {},
  data() {
    return {
      moduleObject: {},
      propData: this.$root.propData.compositeAttr || {
        loadDataCreated: true,
      },
      treeTitle: "",
      searchValue: "",
    };
  },
  watch: {},
  props: {},
  created() {
    this.moduleObject = this.$root.moduleObject;
    this.convertAttrToStyleObject();
    window.vueObj = this;
  },
  mounted() {
    this.initData();
  },
  destroyed() {},
  methods: {
    initData() {
      let _this = this;
      let customInterfaceUrl = this.propData.customInterfaceUrl;
      if (!customInterfaceUrl) {
        this.staticData();
        return;
      } 
      let url = customInterfaceUrl.split("?")[0]; //接口地址
      var param = {
        key: _this.searchValue || "",
        type: "",
      }; //接口参数
      let queryArr =
        customInterfaceUrl.split("?").length > 1
          ? customInterfaceUrl.split("?")[1].split("&")
          : [];
      console.log(queryArr);
      queryArr.forEach((item) => {
        let name = item.split("=")[0];
        let value = item.split("=")[1];
        if (value.indexOf("@[url.") > -1) {
          let p = value.split("@[url.")[1].split("]")[0];
          value = IDM.url.queryString(p);
        }
        param[name] = value;
      });
      console.log("param:", param);
      IDM.http
        .get(url, param)
        .done((data) => {
          console.log("数据111", data);
          if (data.type == "success" && data.code == "200") {
            _this.treeTitle = data.data.name;
            let zNodes = data.data.treelist || [];
            // let nodeId = zNodes.length ? zNodes[0].id : "";
            $.fn.zTree.init($("#treeDemo"), setting, zNodes);
            var zTree = $.fn.zTree.getZTreeObj("treeDemo");
            zTree.expandAll(true);

            if (zNodes[0] && zNodes[0].linkurl) {
              document.querySelector("#ksiframe").src = IDM.url.getWebPath(zNodes[0].linkurl) ;
            }
          } else {
            IDM.message.error(data.message || "请求异常");
          }
        })
        .catch(function (error) {
        });
    },
    staticData() {
      let _this = this;
      var data = {
        code: "200",
        type: "success",
        message: "操作成功",
        metadata: null,
        token: "",
        data: {
          treelist: [
            {
              iconSkin: "tree",
              name: "专业分类",
              pId: "",
              id: "0",
              linkurl:
                "/ctrl/list/251230141207BNQTytTsYnfiHjC5F7B?moduleId=251230100906RVViaingMGbvQe4vEZn",
            },
            {
              iconSkin: "tree",
              name: "理论教育",
              pId: "0",
              id: "250317170733HDDekh9Xmt5DZZB3I6q",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170733HDDekh9Xmt5DZZB3I6q",
            },
            {
              iconSkin: "tree",
              name: "党性教育",
              pId: "0",
              id: "250317170842lbWIS881X6byZrGnIfW",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170842lbWIS881X6byZrGnIfW",
            },
            {
              iconSkin: "tree",
              name: "履职能力培训",
              pId: "0",
              id: "25031717085177PXo50GUa5CxbTIAx8",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=25031717085177PXo50GUa5CxbTIAx8",
            },
            {
              iconSkin: "tree",
              name: "知识培训",
              pId: "0",
              id: "250317170856MxVh2Cl3zh9r7UpFVv8",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170856MxVh2Cl3zh9r7UpFVv8",
            },
            {
              iconSkin: "tree",
              name: "领导力类",
              pId: "0",
              id: "250317170902O2PAwHsyjAY0wMR8oNp",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170902O2PAwHsyjAY0wMR8oNp",
            },
            {
              iconSkin: "tree",
              name: "专业技术类",
              pId: "0",
              id: "2503171709097MSQEEY0o52rsgTIbEf",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171709097MSQEEY0o52rsgTIbEf",
            },
            {
              iconSkin: "tree",
              name: "市场类",
              pId: "0",
              id: "250317170914Pda3kUvXtrJteB159HG",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170914Pda3kUvXtrJteB159HG",
            },
            {
              iconSkin: "tree",
              name: "通用类",
              pId: "0",
              id: "250317170919ESMkpSldbFu2VBEmRo8",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170919ESMkpSldbFu2VBEmRo8",
            },
            {
              iconSkin: "tree",
              name: "马克思主义基本原理",
              pId: "250317170733HDDekh9Xmt5DZZB3I6q",
              id: "25031717093186R53RbtAmAqJ1GB6e3",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=25031717093186R53RbtAmAqJ1GB6e3",
            },
            {
              iconSkin: "tree",
              name: "毛泽东思想",
              pId: "250317170733HDDekh9Xmt5DZZB3I6q",
              id: "250317170945tAjN7bJVwAvgzNfY2UX",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170945tAjN7bJVwAvgzNfY2UX",
            },
            {
              iconSkin: "tree",
              name: "中国特色社会主义理论体系",
              pId: "250317170733HDDekh9Xmt5DZZB3I6q",
              id: "250317170954l5dNlfwUxaZSjTHZulR",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317170954l5dNlfwUxaZSjTHZulR",
            },
            {
              iconSkin: "tree",
              name: "习近平新时代中国特色社会主义思想",
              pId: "250317170733HDDekh9Xmt5DZZB3I6q",
              id: "250317171000WVDEzyfmG3zPLmRsJnO",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171000WVDEzyfmG3zPLmRsJnO",
            },
            {
              iconSkin: "tree",
              name: "党章和党规党纪学习教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "250317171013fGH5dfn6AL7lS0SzUDk",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171013fGH5dfn6AL7lS0SzUDk",
            },
            {
              iconSkin: "tree",
              name: "党的宗旨、革命传统教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "250317171020WISSwJQrYj1mnRUgVPC",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171020WISSwJQrYj1mnRUgVPC",
            },
            {
              iconSkin: "tree",
              name: "党史教育（五史）",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "250317171025wKYD48XAGKWnfXaR7Gj",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171025wKYD48XAGKWnfXaR7Gj",
            },
            {
              iconSkin: "tree",
              name: "党风廉政教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "25031717103176hdMEok2ZLytU9rdIi",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=25031717103176hdMEok2ZLytU9rdIi",
            },
            {
              iconSkin: "tree",
              name: "中华民族共同体意识教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "250317171036N61XLrltmS6iBdmPOmv",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171036N61XLrltmS6iBdmPOmv",
            },
            {
              iconSkin: "tree",
              name: "社会主义核心价值观教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "250317171041DOOtReUnOHmturWUmRN",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171041DOOtReUnOHmturWUmRN",
            },
            {
              iconSkin: "tree",
              name: "中华优秀传统文化教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "250317171046YMA9S3HwtySPzHP9Qus",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171046YMA9S3HwtySPzHP9Qus",
            },
            {
              iconSkin: "tree",
              name: "中华民族传统美德教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "2503171710512vYZ6jWzEEBx9UCzSNU",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171710512vYZ6jWzEEBx9UCzSNU",
            },
            {
              iconSkin: "tree",
              name: "家庭家教家风教育",
              pId: "250317170842lbWIS881X6byZrGnIfW",
              id: "250317171057MO1iCN9rx0To9Cde9z5",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171057MO1iCN9rx0To9Cde9z5",
            },
            {
              iconSkin: "tree",
              name: "重大决策部署培训",
              pId: "25031717085177PXo50GUa5CxbTIAx8",
              id: "250317171115uPCqCRLW3BLKIzgNxdX",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171115uPCqCRLW3BLKIzgNxdX",
            },
            {
              iconSkin: "tree",
              name: "分领域分专题培训2",
              pId: "25031717085177PXo50GUa5CxbTIAx8",
              id: "250317171121YdazDntzPl2rsE9wGrj",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171121YdazDntzPl2rsE9wGrj",
            },
            {
              iconSkin: "tree",
              name: "宪法、法律和政策法规教育培训",
              pId: "25031717085177PXo50GUa5CxbTIAx8",
              id: "250317171126nfStk6VjnIPybUU9x6I",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171126nfStk6VjnIPybUU9x6I",
            },
            {
              iconSkin: "tree",
              name: "总体国家安全观教育",
              pId: "25031717085177PXo50GUa5CxbTIAx8",
              id: "250317171134vG5wvGHePCAkC58qZdi",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171134vG5wvGHePCAkC58qZdi",
            },
            {
              iconSkin: "tree",
              name: "岗位通识教育",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171148ePqQWGmLqmPIelZt28E",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171148ePqQWGmLqmPIelZt28E",
            },
            {
              iconSkin: "tree",
              name: "新知识新技能",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171153vJTXHoGcOB8vE6YrxVe",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171153vJTXHoGcOB8vE6YrxVe",
            },
            {
              iconSkin: "tree",
              name: "综合支撑",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171158gKLG6s1zV3WDrYNfLPX",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171158gKLG6s1zV3WDrYNfLPX",
            },
            {
              iconSkin: "tree",
              name: "市场",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171203Wrufh5QmwjOP4WJw4ra",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171203Wrufh5QmwjOP4WJw4ra",
            },
            {
              iconSkin: "tree",
              name: "销售与服务",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171209JoljUHmpjpkeqlIa0W0",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171209JoljUHmpjpkeqlIa0W0",
            },
            {
              iconSkin: "tree",
              name: "产品",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171214UVqHob5s9j2o5murcib",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171214UVqHob5s9j2o5murcib",
            },
            {
              iconSkin: "tree",
              name: "企业信息化",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171220rJ8fj7lAgpLByZjzvLW",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171220rJ8fj7lAgpLByZjzvLW",
            },
            {
              iconSkin: "tree",
              name: "维护与服务支撑",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171225cuO6PUMQVf6bXO4rwOj",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171225cuO6PUMQVf6bXO4rwOj",
            },
            {
              iconSkin: "tree",
              name: "网发建设",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171230mSLxXFg5ef6OZgySXcH",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171230mSLxXFg5ef6OZgySXcH",
            },
            {
              iconSkin: "tree",
              name: "研发",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171236rXqvvBd6PC7mLsPhnsF",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171236rXqvvBd6PC7mLsPhnsF",
            },
            {
              iconSkin: "tree",
              name: "产数",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171242s3unXKa9QFtiaHUPNwW",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171242s3unXKa9QFtiaHUPNwW",
            },
            {
              iconSkin: "tree",
              name: "科学人文素养",
              pId: "250317170856MxVh2Cl3zh9r7UpFVv8",
              id: "250317171251WYTn0AH82ittidrcphZ",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171251WYTn0AH82ittidrcphZ",
            },
            {
              iconSkin: "tree",
              name: "团队领导力",
              pId: "250317170902O2PAwHsyjAY0wMR8oNp",
              id: "2503171713054GG7tmfPTzSZAirVw9D",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171713054GG7tmfPTzSZAirVw9D",
            },
            {
              iconSkin: "tree",
              name: "个人领导力",
              pId: "250317170902O2PAwHsyjAY0wMR8oNp",
              id: "250317171311NeSNePi6clN7NDIRTwf",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171311NeSNePi6clN7NDIRTwf",
            },
            {
              iconSkin: "tree",
              name: "业务领导力",
              pId: "250317170902O2PAwHsyjAY0wMR8oNp",
              id: "2503171713167hRYQ2xNPOwG770Foj9",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171713167hRYQ2xNPOwG770Foj9",
            },
            {
              iconSkin: "tree",
              name: "领导力测评",
              pId: "250317170902O2PAwHsyjAY0wMR8oNp",
              id: "250317171321Lk2YTZGNFlALUwxEbjA",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171321Lk2YTZGNFlALUwxEbjA",
            },
            {
              iconSkin: "tree",
              name: "云计算-云运维",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "2503171713357oLbrEqGV0KCQHqEE5M",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171713357oLbrEqGV0KCQHqEE5M",
            },
            {
              iconSkin: "tree",
              name: "云计算-架构设计",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171341W7T9wpS3mg2fHEfBGYk",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171341W7T9wpS3mg2fHEfBGYk",
            },
            {
              iconSkin: "tree",
              name: "云计算-Saas服务",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171346Xa0bs3q807TX1zFFvQX",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171346Xa0bs3q807TX1zFFvQX",
            },
            {
              iconSkin: "tree",
              name: "云计算-云计算基础",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "2503171713502nNhWuMmJi7rAopOxNv",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171713502nNhWuMmJi7rAopOxNv",
            },
            {
              iconSkin: "tree",
              name: "人工智能（AI）-人工智能发展、展望与前沿",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171356th8XTJnFHu5ppqy1Ddl",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171356th8XTJnFHu5ppqy1Ddl",
            },
            {
              iconSkin: "tree",
              name: "人工智能（AI）-机器学习理论与实操",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171402QzBvqoQU7KaxeDPgUmK",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171402QzBvqoQU7KaxeDPgUmK",
            },
            {
              iconSkin: "tree",
              name: "人工智能（AI）-深度学习理论与实操",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171409kdaOoktDs2hZWVIkeUJ",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171409kdaOoktDs2hZWVIkeUJ",
            },
            {
              iconSkin: "tree",
              name: "人工智能（AI）-人工智能大模型",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171415kHZPOUSOK15Bn969iAO",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171415kHZPOUSOK15Bn969iAO",
            },
            {
              iconSkin: "tree",
              name: "人工智能（AI）-人工智能应用",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171424QdaLm2hmMvcndMr9csA",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171424QdaLm2hmMvcndMr9csA",
            },
            {
              iconSkin: "tree",
              name: "大数据-大数据平台",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171430VyjzSC4rVb5e0Z460tH",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171430VyjzSC4rVb5e0Z460tH",
            },
            {
              iconSkin: "tree",
              name: "大数据-大数据平台前沿",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171435WcrZgyllcCWJT3XofCu",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171435WcrZgyllcCWJT3XofCu",
            },
            {
              iconSkin: "tree",
              name: "大数据-大数据平台运维",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171441gd6N6pP2pPTmymgyn1v",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171441gd6N6pP2pPTmymgyn1v",
            },
            {
              iconSkin: "tree",
              name: "大数据-大数据应用",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "2503171714476TprbokbeT6LMBBZpnw",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171714476TprbokbeT6LMBBZpnw",
            },
            {
              iconSkin: "tree",
              name: "大数据-数据要素",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "2503171714534KJLUQ5SErYvyuvSw5B",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171714534KJLUQ5SErYvyuvSw5B",
            },
            {
              iconSkin: "tree",
              name: "网信安全-网络安全边界防护",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171500oNEXUi4k80eeRemdAIf",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171500oNEXUi4k80eeRemdAIf",
            },
            {
              iconSkin: "tree",
              name: "网信安全-应用安全",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171506y7QVQg8mtiAn5pKiIxj",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171506y7QVQg8mtiAn5pKiIxj",
            },
            {
              iconSkin: "tree",
              name: "网信安全-数据安全",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171510HyYBvbb2Tn5bULs5UKV",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171510HyYBvbb2Tn5bULs5UKV",
            },
            {
              iconSkin: "tree",
              name: "网信安全-战略和发展趋势",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171515MlGCfK8QaT7WC7fbjh3",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171515MlGCfK8QaT7WC7fbjh3",
            },
            {
              iconSkin: "tree",
              name: "网信安全-安全底层原理",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171520gSrTka907onQD9M1tMg",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171520gSrTka907onQD9M1tMg",
            },
            {
              iconSkin: "tree",
              name: "前沿技术-下一代移动通信",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171526Svz8R6fvWu3sUAOdE6f",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171526Svz8R6fvWu3sUAOdE6f",
            },
            {
              iconSkin: "tree",
              name: "前沿技术-卫星通信技术",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171531ndHTXG5s1R6FoTRzYXy",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171531ndHTXG5s1R6FoTRzYXy",
            },
            {
              iconSkin: "tree",
              name: "前沿技术-智算网络",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171537TSPRpiX4YSx78ACog6v",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171537TSPRpiX4YSx78ACog6v",
            },
            {
              iconSkin: "tree",
              name: "前沿技术-量子信息技术",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171541ThX7AuLg8inyLVY0jfa",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171541ThX7AuLg8inyLVY0jfa",
            },
            {
              iconSkin: "tree",
              name: "前沿技术-战新产业前沿",
              pId: "2503171709097MSQEEY0o52rsgTIbEf",
              id: "250317171547IknOozSmHpPoteSEu1l",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171547IknOozSmHpPoteSEu1l",
            },
            {
              iconSkin: "tree",
              name: "市场-市场营销",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "2503171716172CBt3uqlgy8JEJnqtKd",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171716172CBt3uqlgy8JEJnqtKd",
            },
            {
              iconSkin: "tree",
              name: "市场-产品运营",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171624ODf57i3vdYl6TONZOS9",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171624ODf57i3vdYl6TONZOS9",
            },
            {
              iconSkin: "tree",
              name: "市场-经营管理",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171629bfaLpZEXkXnzHxwPZsH",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171629bfaLpZEXkXnzHxwPZsH",
            },
            {
              iconSkin: "tree",
              name: "渠道-销售管理",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171634RbAbTuhMCJWySpGg4VC",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171634RbAbTuhMCJWySpGg4VC",
            },
            {
              iconSkin: "tree",
              name: "渠道-销售技能",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171638MpsuBdXBCnVPUPvSm3N",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171638MpsuBdXBCnVPUPvSm3N",
            },
            {
              iconSkin: "tree",
              name: "渠道-产数营销",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171643YQUwJFVRtrhkrnCSojJ",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171643YQUwJFVRtrhkrnCSojJ",
            },
            {
              iconSkin: "tree",
              name: "渠道-战新营销",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "2503171716481g2BWuKBkvyj9LqD9D9",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171716481g2BWuKBkvyj9LqD9D9",
            },
            {
              iconSkin: "tree",
              name: "渠道-渠道管理",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171654Wrf4hdVcq0LyNSdyNbl",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171654Wrf4hdVcq0LyNSdyNbl",
            },
            {
              iconSkin: "tree",
              name: "渠道-渠道营销",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171701jwceSYrUYuvjw6T7L3S",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171701jwceSYrUYuvjw6T7L3S",
            },
            {
              iconSkin: "tree",
              name: "客服-服务",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "2503171717088w19ESY15TEJVRUyfIa",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171717088w19ESY15TEJVRUyfIa",
            },
            {
              iconSkin: "tree",
              name: "销售-绩效改进",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171712ejpu4jRGvjTjQlLMts1",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171712ejpu4jRGvjTjQlLMts1",
            },
            {
              iconSkin: "tree",
              name: "销售-数字化营销",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171717BPOpzBokhQ60dE70XXF",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171717BPOpzBokhQ60dE70XXF",
            },
            {
              iconSkin: "tree",
              name: "渠道-直播及短视频",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171722dWdivnVkqvKifDM4YcD",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171722dWdivnVkqvKifDM4YcD",
            },
            {
              iconSkin: "tree",
              name: "政企-解决方案",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "25031717172806tQCUlYoewpfJab9Cf",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=25031717172806tQCUlYoewpfJab9Cf",
            },
            {
              iconSkin: "tree",
              name: "市场-绩效管理",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171733e5uCbpjf60oHOjY3wLE",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171733e5uCbpjf60oHOjY3wLE",
            },
            {
              iconSkin: "tree",
              name: "政企-咨询规划",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171741hhTR7PXlOsI5vSZetTk",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171741hhTR7PXlOsI5vSZetTk",
            },
            {
              iconSkin: "tree",
              name: "政企-行业洞察",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "2503171717488T5MS5OhSjCSSUOpSXx",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171717488T5MS5OhSjCSSUOpSXx",
            },
            {
              iconSkin: "tree",
              name: "政企-业务架构",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171753FSKz1I483qgrfzWe3lY",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171753FSKz1I483qgrfzWe3lY",
            },
            {
              iconSkin: "tree",
              name: "政企-系统架构",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171759JSzZ8RWVkGxiw7zszAT",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171759JSzZ8RWVkGxiw7zszAT",
            },
            {
              iconSkin: "tree",
              name: "政企-客户运营",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171804PTHCiZKLxoCCltJ2vfa",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171804PTHCiZKLxoCCltJ2vfa",
            },
            {
              iconSkin: "tree",
              name: "政企-项目交付管理",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171809VBC9whC5MLCUlSeSzqa",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171809VBC9whC5MLCUlSeSzqa",
            },
            {
              iconSkin: "tree",
              name: "政企-生态合作",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171814InjTMVK7qRVsSsPoUkN",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171814InjTMVK7qRVsSsPoUkN",
            },
            {
              iconSkin: "tree",
              name: "政企-系统集成",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "25031717181925P1xLMUM5nv7Nvxuk7",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=25031717181925P1xLMUM5nv7Nvxuk7",
            },
            {
              iconSkin: "tree",
              name: "市场-数字化转型",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "2503171718242ufpGtaWPl6wj8cGqbW",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171718242ufpGtaWPl6wj8cGqbW",
            },
            {
              iconSkin: "tree",
              name: "政企-行业应用",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171828eYZUWNbjK8pjaGX99fb",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171828eYZUWNbjK8pjaGX99fb",
            },
            {
              iconSkin: "tree",
              name: "市场-营销实战",
              pId: "250317170914Pda3kUvXtrJteB159HG",
              id: "250317171833Xzhxb62xeimLSweNli6",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171833Xzhxb62xeimLSweNli6",
            },
            {
              iconSkin: "tree",
              name: "人才测评",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "2503171718504tVD6KRiSFIIGPLuSiw",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171718504tVD6KRiSFIIGPLuSiw",
            },
            {
              iconSkin: "tree",
              name: "素质拓展",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317171858TLqxvy1tQCby33kX8uM",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171858TLqxvy1tQCby33kX8uM",
            },
            {
              iconSkin: "tree",
              name: "公文写作",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "25031717190248EJgJmUibZmPJhB9tQ",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=25031717190248EJgJmUibZmPJhB9tQ",
            },
            {
              iconSkin: "tree",
              name: "现场教学",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317171907Z2dtB0R6lcxmFNCfn8q",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171907Z2dtB0R6lcxmFNCfn8q",
            },
            {
              iconSkin: "tree",
              name: "影响力",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317171914eATNrB6M1cO1h4nGBON",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171914eATNrB6M1cO1h4nGBON",
            },
            {
              iconSkin: "tree",
              name: "课程开发",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317171919hx5f5uyjyVP5Yr8f9LE",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171919hx5f5uyjyVP5Yr8f9LE",
            },
            {
              iconSkin: "tree",
              name: "思维方法",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317171925FyHXgWUzI5PnZnyoC71",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171925FyHXgWUzI5PnZnyoC71",
            },
            {
              iconSkin: "tree",
              name: "标杆学习",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "2503171719337SpjWN1cuaYLVLNaKPr",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=2503171719337SpjWN1cuaYLVLNaKPr",
            },
            {
              iconSkin: "tree",
              name: "组织变革",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317171939Y1i0uyHrnyKpewlKcym",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171939Y1i0uyHrnyKpewlKcym",
            },
            {
              iconSkin: "tree",
              name: "a战略咨询",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317171949JwN0b6WoWtLralkvg32",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317171949JwN0b6WoWtLralkvg32",
            },
            {
              iconSkin: "tree",
              name: "经验萃取",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317172008zcVOBLSeAP8DC2Qmn0M",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317172008zcVOBLSeAP8DC2Qmn0M",
            },
            {
              iconSkin: "tree",
              name: "引导技术",
              pId: "250317170919ESMkpSldbFu2VBEmRo8",
              id: "250317172018NYTqVmTOIK1DAQOmdzs",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250317172018NYTqVmTOIK1DAQOmdzs",
            },
            {
              iconSkin: "tree",
              name: "2025-0325一级分类",
              pId: "0",
              id: "250325160345Cbh5ZVoD87xp7QsAXqe",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250325160345Cbh5ZVoD87xp7QsAXqe",
            },
            {
              iconSkin: "tree",
              name: "2025-0325二级分类",
              pId: "0",
              id: "250325160402F9Zp724NvlCS9l8Dzjq",
              linkurl:
                "/ctrl/list/24123110374349Kt0LTCE86z2ymBVFx?moduleId=2412311033378pCLbZLZSnes9Cyeg4o&fid=250325160402F9Zp724NvlCS9l8Dzjq",
            },
          ],
          name: "专业分类",
        },
        serverTime: "2026-03-11 10:28:55",
      };
      console.log("数据111", data);
      if (data.type == "success" && data.code == "200") {
        _this.treeTitle = data.data.name;
        let zNodes = data.data.treelist || [];
        // let nodeId = zNodes.length ? zNodes[0].id : "";
        $.fn.zTree.init($("#treeDemo"), setting, zNodes);
        var zTree = $.fn.zTree.getZTreeObj("treeDemo");
        zTree.expandAll(true);

        if (zNodes[0] && zNodes[0].linkurl) {
          document.querySelector("#ksiframe").src = IDM.url.getWebPath(zNodes[0].linkurl);
        }
      } else {
        IDM.message.error(data.message || "请求异常");
      }
    },
    /**
     * 提供父级组件调用的刷新prop数据组件
     */
    propDataWatchHandle(propData) {
      this.propData = propData.compositeAttr || {};
      this.number = this.propData.numberCount ? this.propData.numberCount : 6;
      this.convertAttrToStyleObject();
    },
    /**
     * 把属性转换成样式对象
     */
    convertAttrToStyleObject() {
      var styleObject = {};
      if (this.propData.bgSize && this.propData.bgSize == "custom") {
        styleObject["background-size"] =
          (this.propData.bgSizeWidth
            ? this.propData.bgSizeWidth.inputVal +
              this.propData.bgSizeWidth.selectVal
            : "auto") +
          " " +
          (this.propData.bgSizeHeight
            ? this.propData.bgSizeHeight.inputVal +
              this.propData.bgSizeHeight.selectVal
            : "auto");
      } else if (this.propData.bgSize) {
        styleObject["background-size"] = this.propData.bgSize;
      }
      if (this.propData.positionX && this.propData.positionX.inputVal) {
        styleObject["background-position-x"] =
          this.propData.positionX.inputVal + this.propData.positionX.selectVal;
      }
      if (this.propData.positionY && this.propData.positionY.inputVal) {
        styleObject["background-position-y"] =
          this.propData.positionY.inputVal + this.propData.positionY.selectVal;
      }
      for (const key in this.propData) {
        if (this.propData.hasOwnProperty.call(this.propData, key)) {
          const element = this.propData[key];
          if (!element && element !== false && element != 0) {
            continue;
          }
          switch (key) {
            case "width":
            case "height":
              styleObject[key] = element;
              break;
            case "bgColor":
              if (element && element.hex8) {
                styleObject["background-color"] = element.hex8;
              }
              break;
            case "box":
              IDM.style.setBoxStyle(styleObject, element);
              break;
            case "bgImgUrl":
              styleObject[
                "background-image"
              ] = `url(${window.IDM.url.getWebPath(element)})`;
              break;
            case "positionX":
              //背景横向偏移

              break;
            case "positionY":
              //背景纵向偏移

              break;
            case "bgRepeat":
              //平铺模式
              styleObject["background-repeat"] = element;
              break;
            case "bgAttachment":
              //背景模式
              styleObject["background-attachment"] = element;
              break;
            case "border":
              IDM.style.setBorderStyle(styleObject, element);
              break;
            case "font":
              IDM.style.setFontStyle(styleObject, element);
              break;
          }
        }
      }
      window.IDM.setStyleToPageHead(this.moduleObject.id, styleObject);
    },
    /**
     * 通用的url参数对象
     * 所有地址的url参数转换
     */
    commonParam() {
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
    getExpressData(dataName, dataFiled, resultData) {
      //给defaultValue设置dataFiled的值
      var _defaultVal = undefined;
      if (dataFiled) {
        var filedExp = dataFiled;
        filedExp = dataName + (filedExp.startsWiths("[") ? "" : ".") + filedExp;
        var dataObject = { IDM: window.IDM };
        dataObject[dataName] = resultData;
        _defaultVal = window.IDM.express.replace.call(
          this,
          "@[" + filedExp + "]",
          dataObject
        );
      }
      //对结果进行再次函数自定义
      if (
        this.propData.customFunction &&
        this.propData.customFunction.length > 0
      ) {
        var params = this.commonParam();
        var resValue = "";
        try {
          resValue =
            window[this.propData.customFunction[0].name] &&
            window[this.propData.customFunction[0].name].call(this, {
              ...params,
              ...this.propData.customFunction[0].param,
              moduleObject: this.moduleObject,
              expressData: _defaultVal,
              interfaceData: resultData,
            });
        } catch (error) {}
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
    receiveBroadcastMessage(object) {
      console.log("组件收到消息", object);
      if (object.type && object.type == "linkageReload") {
        this.getLoginStatus();
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
    sendBroadcastMessage(object) {
      window.IDM.broadcast && window.IDM.broadcast.send(object);
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
    },
  },
};
function nodeEvents(event, treeId, treeNode) {
  if (treeNode.linkurl) {
    document.querySelector("#ksiframe").src = IDM.url.getWebPath(treeNode.linkurl);
  }
}
</script>
<style lang="scss" scoped>
.ITree {
  height: calc(100vh - 10px) !important;
  padding: 5px 5px 0 5px;
  overflow: hidden;
  font-size: 16px;
  .tree-main {
    height: 100%;
    width: 100%;
    float: left;
    padding: 0 10px;
    background: #ffffff;
    font-size: 16px;
    color: #2f332a;
    display: flex;
    .left {
      width: 16.67%;
      height: 100%;
      display: flex;
      flex-direction: column;
      border: 1px solid #d8d8d8;
      margin-top: 10px;
      height: calc(100% - 20px);
      .title {
        width: 100%;
        height: 45px;
        color: #fff;
        line-height: 45px;
        margin-bottom: 10px;
        background: #0086d9;
        padding: 0 13px;
        i {
          margin-right: 7px;
        }
      }
      .search {
        position: relative;
        padding: 0 10px;
        input {
          width: 100%;
          height: 38px;
          line-height: 1.3;
          line-height: 38px;
          border-width: 1px;
          border-style: solid;
          border-color: #e6e6e6;
          background-color: #fff;
          border-radius: 5px;
          padding: 0 45px 0 12px;
        }
        .search-span {
          position: absolute;
          right: 13px;
          top: 8px;
          text-align: center;
          width: 24px;
          height: 24px;
          cursor: pointer;
          i {
            font-weight: bold;
            font-size: 20px;
          }
        }
      }
      .ztree {
        margin: 5px 0;
        padding: 0 0 0 10px;
        color: #333;
        flex: 1;
        overflow: auto;
      }
    }
    .right {
      width: 83.33%;
      height: 100%;
    }
  }
}
</style>


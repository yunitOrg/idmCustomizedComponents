/* eslint-disable */
(function ($) {
    $.fn.simpleSyncTree = function (options) {
        var that = $(this);
        var treeDataUrl = options.treeDataUrl;
        var showData = options.onClick;
        var autoParam = options.autoParam;
        var initData = options.initData;
        var noDefaltRoot = options.noDefaltRoot;
        var fid = options.fid;
        var root = options.root;
        var showIcon = options.showIcon;
        var onAsyncSuccess = options.onAsyncSuccess;
        var initSuccess = options.initSuccess;
        var onRightClick = options.onRightClick;
        if(!showIcon){
            showIcon=false;
        }

        if (!root) {
            root = false;
        }
        if (!fid) {
            if(!noDefaltRoot){
                fid = "0";
            }
        }
        if (!autoParam) {
            autoParam = ["id=fid"];
        }
        var setting = {
            async: {
                enable: true,
                dataType: "json",
                url: treeDataUrl,
                autoParam: autoParam
            }, data: {
                simpleData: {
                    enable: true
                }
            }, callback: {
                onClick: showData,
                onAsyncSuccess: onAsyncSuccess,
                onRightClick:onRightClick
            }, view: {
                showIcon: showIcon,
                nameIsHTML: options.nameIsHTML,
                showTitle: options.showTitle === false ? false : true
            }
        };
        var zTree = null;
        var treeId = null;
        if (initData) {
            zTree = $.fn.zTree.init(that, setting, initData);
            treeId = zTree.setting.treeId;
        } else {
            $.post(treeDataUrl, {"fid": fid, "root": root}, function (data) {
                zTree = $.fn.zTree.init(that, setting, data);
                treeId = zTree.setting.treeId;
                if (initSuccess&&$.isFunction(initSuccess)) {
                    initSuccess(zTree, treeId);
                }
            }, "json");
        }
        top.reloadChildTree = function (rootId, selectId, type) {
            if (!rootId) {
                var node = zTree.getNodeByParam("id", selectId, null);
                if (node) {
                    rootId = node.pid;
                }
            }
            if (0 == rootId) {
                $.post(treeDataUrl, {}, function (data) {
                    zTree = $.fn.zTree.init(that, setting, data);
                    treeId = zTree.setting.treeId;
                }, "json");
            } else {
                var node = zTree.getNodeByParam("id", rootId, null);
                if (node) {
                    zTree.reAsyncChildNodes(node, "refresh", false, function () {
                        zTree = $.fn.zTree.getZTreeObj(treeId);
                        var cnode = zTree.getNodeByParam("id", selectId, null);
                        zTree.reAsyncChildNodes(cnode, "refresh", false);
                        if ("list" == type) {
                            node = zTree.getNodeByParam("id", rootId, null);
                            zTree.selectNode(node);
                        } else {
                            zTree.selectNode(cnode);
                            zTree.expandNode(cnode);
                        }
                    });
                } else {
                    $.post(treeDataUrl, {"fid": fid}, function (data) {
                        zTree = $.fn.zTree.init(that, setting, data);
                        treeId = zTree.setting.treeId;
                    }, "json");
                }
            }
        }
    }

    $.fn.simpleTree = function (options) {
        var that = $(this);
        var showData = options.onClick;
        var initData = options.initData;
        var showIcon = options.showIcon;
        var switchNodeCallback = options.switchNodeCallback || "";
        if(!showIcon){
            showIcon=false;
        }
        var setting = {
            data: {
                simpleData: {
                    enable: true
                }
            }, callback: {
                onClick: showData
            }, view: {
                showIcon: showIcon
            },
            "switchNodeCallback":switchNodeCallback
        };

        if(options.check){
            if(options.check == "radio"){
                setting.check = {
                    enable: true,
                    chkStyle: "radio",
                    radioType: "all"
                }
            }else if(options.check == "checkbox"){
                setting.check = {
                    enable: true,
                    chkStyle: "checkbox",
                    radioType: "all"
                }
            }
        }


        zTree = $.fn.zTree.init(that, setting, initData);
        return zTree;
    }
})(jQuery);
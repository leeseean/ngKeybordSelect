 angular.module('ng-keybord-select', [])
     //grid多选的组别
     .directive('gridGroup', [function() {
         return {
             scope: {
                 gridSelectName: '@',
             },
             bindToController: true,
             controllerAs: "vm",
             controller: ['$element', '$attrs', function(ele, attrs) {
                 var vm = this;
                 var preIndex;
                 var pushNum;
                 var nowIndex;
                 var itemName;
                 var index = 0;
                 vm.Items = [];
                 vm.itemName = "item";
                 vm.addItem = function(item) {
                     item.index = index++;
                     vm.Items.push(item);
                 }
                 //shfit 批量选择
                 vm.mulitSelectItem = function(item) {
                     nowIndex = item.index;
                     pushNum = Math.abs(nowIndex - preIndex);
                     angular.forEach(vm.Items, function(value, key) {
                         if (nowIndex > preIndex) {
                             //向下选择,向上处理
                             for (preIndex; preIndex < nowIndex; preIndex++) {
                                 vm.Items[preIndex + 1].isSelected = true
                             }
                         } else if (nowIndex < preIndex) {
                             //向上选择,向下处理
                             for (preIndex; preIndex > nowIndex; preIndex--) {
                                 vm.Items[preIndex - 1].isSelected = true
                             }
                         }
                     })
                 }
                 //ctrl 多选
                 vm.selectItem = function(item) {
                     item.isSelected = !!!item.isSelected;
                     preIndex = item.index;
                 }
                 //单选
                 vm.selectSingleItem = function(item) {
                     item[vm.gridSelectName] = !!!item[vm.gridSelectName];
                     angular.forEach(vm.Items, function(value, key) {
                         if (value[vm.gridSelectName] && item.$$hashKey != value.$$hashKey) {
                             value[vm.gridSelectName] = false;
                         }
                     })
                     preIndex = item.index;
                 }
                 return vm;
             }],
             link: function(scope, ele, attrs, ctrls) {

             }
         }
     }])
     //grid多选功能实现，item容器
     .directive('gridSelected', [function() {
         return {
             require: '^gridGroup',
             link: function(scope, ele, attrs, ctrls) {
                 var item = scope[attrs.gridSelected]
                 var itemDisabled = scope[attrs.gridSelectedDisabled];
                 var result;
                 //获取选中的数据
                 var getSelectedItems = function() {
                     result = [];
                     for (var i in ctrls.Items) {
                         if (ctrls.Items[i][ctrls['gridSelectName']]) {
                             result.push(ctrls.Items[i]);
                         }
                     }
                     return result;
                 }
                 ctrls.addItem(item)
                 if (!itemDisabled) {
                     ele.on('click', function(e) {
                         scope.$apply(function() {
                             result = getSelectedItems()                             
                             scope.$emit('selectStart', result)
                             if (e.ctrlKey || e.metaKey) {
                                 ctrls.selectItem(item);
                             } else if (e.shiftKey) {
                                 ctrls.mulitSelectItem(item);
                             } else {
                                 ctrls.selectSingleItem(item);
                             }
                             result = getSelectedItems()                             
                             scope.$emit('selectEnd', result)
                         });
                     })
                 }
             }
         }
     }])
     .factory('MulitGrid', ['$rootScope', function($rootScope) {
         var selectItems = [];
         var itemsLength = "";
         $rootScope.$on('selectEnd', function(event, data) {
             selectItems = data;
         })
         return {
             getSelectItems: function() {
                 return selectItems;
             },
             getItemsLength: function() {
                 return selectItems.length;
             }
         }
     }])
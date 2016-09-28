/**
 * ESUI (Enterprise Simple UI)
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @ignore
 * @file FixedColumns
 * @author chuzhenyang(chuzhenyang@baidu.com)
 */
define(
    function (require) {
        var esui = require('esui/main');
        var Extension = require('esui/Extension');
        var eoo = require('eoo');
        var DataTable = require('../DataTable');
        var u = require('underscore');
        require('datatables-fixedcolumns');

        /**
         * 表格子行扩展
         *
         * USEAGE:
         *        要配置三个属性
         *        fixedColumns: 是否使用FixedColumns扩展(true/false)
         *        leftFixedColumns: 左侧列fixed的个数(number)
         *        rightFixedColumns: 右侧列fixed的个数(number)
         * @constructor
         */
        var FixedColumns = eoo.create(
            Extension,
            {
                /**
                 * 指定扩展类型，始终为`"FixedColumns"`
                 *
                 * @type {string}
                 */
                type: 'FixedColumns',

                /**
                 * 激活扩展
                 *
                 * @override
                 */
                activate: function () {
                    var target = this.target;
                    // 只对`DataTable`控件生效
                    if (!(target instanceof DataTable && target.fixedColumns)) {
                        return;
                    }


                    var options = target.getDataTableExtendOptions();
                    target.getDataTableExtendOptions = function () {
                        return u.extend(options, {
                            fixedColumns: {
                                leftColumns: this.leftFixedColumns,
                                rightColumns: this.rightFixedColumns
                            }
                        });
                    };

                    var originalResetSortable = target.resetSortable;
                    var originalResetSelect = target.resetSelect;
                    var originalResetSelectMode = target.resetSelectMode;
                    var originalResetFieldOrderable = target.resetFieldOrderable;
                    var originalSetAllRowSelected = target.setAllRowSelected;

                    target.resetSortable = function (sortable) {
                        originalResetSortable.call(this, sortable);
                        this.dataTable.fixedColumns().relayout();
                    };

                    target.resetSelect = function (select) {
                        originalResetSelect.call(this, select);
                        this.dataTable.fixedColumns().relayout();
                    };

                    target.resetSelectMode = function (selectMode) {
                        originalResetSelectMode.call(this, selectMode);
                        this.dataTable.fixedColumns().relayout();
                    };

                    target.resetFieldOrderable = function (orderBy, order) {
                        originalResetFieldOrderable.call(this, orderBy, order);
                        this.dataTable.fixedColumns().relayout();
                    };

                    target.setAllRowSelected = function (isSelected) {
                        originalSetAllRowSelected.call(this, isSelected);
                        this.dataTable.fixedColumns().relayout();
                    };

                    target.on('columnreorder', fixedColumnsHandler);
                    target.on('selectall', fixedColumnsHandler);

                    this.$super(arguments);
                },

                /**
                 * 取消扩展的激活状态
                 *
                 * @override
                 */
                inactivate: function () {
                    var target = this.target;
                    // 只对`DataTable`控件生效
                    if (!(target instanceof DataTable)) {
                        return;
                    }

                    target.un('columnreorder', fixedColumnsHandler);
                    target.un('selectall', fixedColumnsHandler);
                    this.$super(arguments);
                }
            }
        );

        function fixedColumnsHandler() {
            this.dataTable.fixedColumns().relayout();
        }

        esui.registerExtension(FixedColumns);
        return FixedColumns;
    }
);

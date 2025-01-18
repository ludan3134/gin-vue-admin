<template>
  <div class="spp-theme-body spp-theme-pad">
    <Hamburger />

    <!-- 列表查询条件 -->
    <el-form
      :inline="true"
      size="small"
      :model="queryParams"
      class="spp-form-search spp-theme-top"
    >
      <el-form-item>
        <el-input
          v-model="queryParams.name"
          maxlength="20"
          placeholder="请输入名称"
          clearable
          @keyup.enter.native="onSearch"
        />
      </el-form-item>

      <el-form-item>
        <el-button
          class="spp-form-btn"
          size="small"
          type="primary"
          @click="onSearch()"
          >查询</el-button
        >
      </el-form-item>
      <el-form-item>
        <el-upload
          action=""
          :auto-upload="false"
          :multiple="false"
          :show-file-list="false"
          :on-change="uploadByJsqd"
          :file-list="fileList"
        >
          <el-button class="spp-form-btn" type="primary" size="mini"
            >导入</el-button
          >
        </el-upload>
      </el-form-item>
      <el-form-item>
        <span class="spp-form-label" style="width: 150px">
          <i class="icon" /><i class="label">创建时间:</i>
        </span>
        <el-date-picker
          v-model="queryParams.timeRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          value-format="yyyy-MM-dd"
          format="yyyy年MM月dd日"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          class="spp-form-btn"
          size="small"
          type="warning"
          @click="onExport()"
          ><i class="el-icon-download" />导出</el-button
        >
      </el-form-item>
    </el-form>
    <!-- 时间导出 -->

    <!-- 列表 -->
    <div class="spp-table-group spp-theme-top spp-theme-pad">
      <div class="spp-table-btns">
        <el-button size="small" type="primary" @click="onAdd"
          ><i class="el-icon-plus" />新增
        </el-button>
        <el-button size="small" type="primary" @click="onEdit"
          ><i class="el-icon-edit" />编辑
        </el-button>
        <el-button size="small" type="primary" @click="onLook"
          ><i class="el-icon-search" />查看
        </el-button>
        <el-button size="small" type="danger" @click="onClickDelete"
          ><i class="el-icon-delete" />删除
        </el-button>
      </div>
      <el-table
        ref="tableRef"
        v-loading="tableLoading"
        class="spp-table spp-theme-top"
        :data="tableData"
        :stripe="true"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        style="width: 100%"
        @selection-change="onSelectionChange"
      >
        <el-table-column prop="number" type="index" label="序号" />
        <el-table-column type="selection" width="55" />
        <el-table-column prop="employNum" label="编号" width="200" />
        <el-table-column prop="name" label="名称" />
        <el-table-column prop="machine" label="打卡机器" />
        <el-table-column prop="date" label="打卡日期" />
        <el-table-column prop="clockInTime" label="上班打卡时间" />
        <el-table-column prop="clockOutTime" label="下班打卡时间" />
        <el-table-column fixed="right" label="操作" width="120">
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-edit-outline"
              @click="rowEdit(scope.row)"
            />
            <el-button
              size="mini"
              icon="el-icon-delete"
              type="danger"
              @click="onClickDelete(scope.row)"
            />
          </template>
        </el-table-column>
      </el-table>
      <Pagination
        v-show="tableTotal > 0"
        :total="tableTotal"
        :page.sync="queryParams.page"
        :limit.sync="queryParams.limit"
        @pagination="requestList"
      />
    </div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="isShowDialog"
      top="8vh"
      width="760px"
      :close-on-click-modal="false"
      @opened="onOpenDialog"
      @closed="onClosedDialog"
    >
      <div class="spp-dialog">
        <el-form
          ref="dialogFormRef"
          :model="dialogFormData"
          :inline="true"
          :rules="dialogRules"
          label-width="120px"
          size="small"
          :disabled="dialogIsLook"
        >
          <el-form-item label="姓名" prop="name">
            <el-input
              v-model="dialogFormData.name"
              maxlength="20"
              align="right"
              placeholder="请输入名称"
              clearable
            />
          </el-form-item>
          <el-form-item label="编号" prop="employNum">
            <el-input
              v-model="dialogFormData.employNum"
              maxlength="20"
              placeholder="员工编号"
              clearable
            />
          </el-form-item>
          <el-form-item label="打卡日期:" prop="date">
            <el-date-picker
              v-model="dialogFormData.date"
              align="right"
              type="date"
              placeholder="选择日期"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="打卡时间:" prop="clickInTime">
            <el-time-picker
              is-range
              v-model="dialogFormData.clickInTime"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
              value-format="HH:mm:ss"
            >
            </el-time-picker>
          </el-form-item>
        </el-form>
        <div
          v-if="!dialogIsLook"
          slot="footer"
          class="dialog-footer spp-dialog-btns"
        >
          <el-button
            :loading="dialogSubmitBtnLoading"
            type="primary"
            size="small"
            @click="onDialogSubmit()"
            >保存
          </el-button>
          <el-button size="small" @click="isShowDialog = false">取消</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import TimeUtils from "@/utils/timeUtils";
import Pagination from "@/components/Pagination";
import Hamburger from "@/components/Hamburger/index2";
import {
  getAttendanceList,
  editAttendance,
  deleteAttendance,
} from "@/api/attendance/attendance";
import {
  importDevice,
  exportAttendanceSheets,
} from "@/api/attendance/attendance";

import XLSX from "xlsx";
export default {
  components: {
    Pagination,
    Hamburger,
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      fileList: [], //上传的文件列表
      tableTotal: 0, // 默认数据总数
      tableSizes: this.pageGroup.sizes, // 显示条数分组
      selectionList: [], // 勾选一行或多行数据
      queryParams: {
        page: 1,
        limit: this.pageGroup.size,
        name: "",
        timeRange: ["", ""],
      },
      // 弹框相关
      dialogTitle: "",
      isShowDialog: false,
      dialogSubmitBtnLoading: false,
      dialogIsLook: false,
      dialogFormData: {
        date: "",
        clockInTime: "",
        clockOutTime: "",
        date: "",
        employNum: "",
        id: 0,
        machine: "",
        name: "",
        clickInTime: [],
      },
      dialogRules: {},
      selectId: "",
    };
  },
  mounted() {
    this.requestList();
  },
  methods: {
    onSearch() {
      this.queryParams.page = 1;
      this.requestList();
    },
    // 加载列表数据
    requestList() {
      var that = this;
      var params = JSON.parse(JSON.stringify(this.queryParams));
      console.log(JSON.stringify(params));
      // this.tableLoading = true
      getAttendanceList(params)
        .then((res) => {
          that.tableLoading = false;
          if (res.code === 20000) {
            that.tableData = res.data.list;
            that.tableTotal = res.data.total;
          } else {
            that.$message.error(res.msg);
          }
        })
        .catch((error) => {
          that.tableLoading = false;
          console.log(JSON.stringify(error));
        });
    },

    onSelectionChange(val) {
      this.selectionList = val;
    },
    // 操作按钮
    onAdd() {
      this.dialogFormData = {};
      this.dialogTitle = "新增";
      this.dialogIsLook = false;
      this.isShowDialog = true;
    },
    onLook() {
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择记录");
        return;
      } else if (this.selectionList.length > 1) {
        this.$message.warning("只能选择一条记录！");
        return;
      } else {
        this.selectId = this.selectionList[0].id;
        this.dialogTitle = "查看";
        this.dialogIsLook = true;
        this.handelDialogSetData(this.selectionList[0]);
        this.isShowDialog = true;
      }
    },
    onEdit() {
      if (this.selectionList.length === 0) {
        this.$message.warning("请选择记录");
        return;
      } else if (this.selectionList.length > 1) {
        this.$message.warning("只能选择一条记录！");
        return;
      } else {
        this.selectId = this.selectionList[0].id;
        this.dialogTitle = "编辑";
        this.dialogIsLook = false;
        this.handelDialogSetData(this.selectionList[0]);
        this.isShowDialog = true;
      }
    },
    onExport() {
      console.log("timeRange before export:", this.queryParams.timeRange);
      var that = this;
      var params = {};
      params = this.queryParams;
      params.startDate = this.queryParams.timeRange
        ? TimeUtils.startOfDay(this.queryParams.timeRange[0])
        : "";
      params.endDate = this.queryParams.timeRange
        ? TimeUtils.endOfDay(this.queryParams.timeRange[1])
        : "";
      console.log(JSON.stringify(params));
      if (params.startDate === "" || params.endDate === "") {
        this.$message.error("请选择导出开始至结束日期");
        return;
      }
      this.tableLoading = true;
      exportAttendanceSheets(params)
        .then((res) => {
          that.tableLoading = false;
          console.log("res", res);
          const blob = new Blob([res], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          });
          const startDatePart = params.startDate
            ? params.startDate.split(" ")[0]
            : "";
          const endDatePart = params.endDate
            ? params.endDate.split(" ")[0]
            : "";
          let url = window.URL.createObjectURL(blob); // 创建一个临时的url指向blob对象
          let a = document.createElement("a");
          a.href = url;
          a.download = `考勤记录_${startDatePart}--${endDatePart}.xlsx`;

          // a.download = "attendance.xlsx";
          a.click();
          // 释放这个临时的对象url
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("打开文件失败:", error);
        });
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    onClickDelete(row) {
      var name = "";
      if (row && row.id) {
        name = row.name;
      } else {
        name = this.selectionList.map((item) => item.name).join(",");
      }
      this.$confirm(
        `确定要删除用户 ${name} ，此操作将永久删除, 是否继续?`,
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        }
      ).then(() => {
        var params = { ids: [] };
        if (row && row.id) {
          params.ids = [row.id];
        } else {
          params.ids = this.selectionList.map((item) => item.id); // 直接使用数组
        }
        this.deleteRequest(params);
      });
    },
    // 通过下划线点击row
    onClickRow(row) {
      console.log(JSON.stringify(row));
      this.selectId = row.id;
      this.dialogTitle = "查看";
      this.dialogIsLook = true;
      this.handelDialogSetData(row);
      this.isShowDialog = true;
    },

    // 行编辑
    rowEdit(row) {
      console.log(JSON.stringify(row));
      this.dialogTitle = "编辑";
      const clockInTime = row.clockInTime;
      const clockOutTime = row.clockOutTime;

      const timeArray = [clockInTime, clockOutTime];
      row.clickInTime = timeArray;
      this.dialogIsLook = false;
      this.handelDialogSetData(row);
      this.isShowDialog = true;
    },

    // 对弹框数据赋值
    handelDialogSetData(data) {
      var that = this;
      this.$nextTick(() => {
        that.dialogFormData = { ...data };
      });
    },
    // 弹框相关
    onOpenDialog() {},
    onClosedDialog() {
      this.$refs.tableRef.clearSelection();
      if (!this.dialogIsLook) {
        this.$refs["dialogFormRef"].resetFields(); // 仅清除验证
      }
    },
    onDialogSubmit() {
      this.$refs["dialogFormRef"].validate((valid) => {
        if (valid) {
          this.submitRequest();
        }
      });
    },
    deleteRequest(params) {
      var that = this;
      console.log(JSON.stringify(params));
      deleteAttendance(params)
        .then((res) => {
          if (res.code === 20000) {
            that.$message.success("删除成功!");
            that.isShowDialog = false;
            that.requestList();
          } else {
            that.$message.error(res.msg);
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
    },
    submitRequest() {
      var that = this;
      this.dialogSubmitBtnLoading = true;

      var params = {};
      params = this.dialogFormData;
      params.clockInTime = this.dialogFormData.clickInTime[0];
      params.clockOutTime = this.dialogFormData.clickInTime[1];
      // console.log(JSON.stringify(params))

      if (this.dialogTitle === "新增") {
        editAttendance(params)
          .then((res) => {
            that.dialogSubmitBtnLoading = false;
            if (res.code === 20000) {
              that.$message.success("保存成功!");
              that.isShowDialog = false;
              that.requestList();
            } else {
              that.$message.error(res.msg);
            }
          })
          .catch((error) => {
            that.dialogSubmitBtnLoading = false;
            console.log(JSON.stringify(error));
          });
      }
      if (this.dialogTitle === "编辑") {
        editAttendance(params)
          .then((res) => {
            that.dialogSubmitBtnLoading = false;
            if (res.code === 20000) {
              that.$message.success("保存成功!");
              that.isShowDialog = false;
              that.requestList();
            } else {
              that.$message.error(res.msg);
            }
          })
          .catch((error) => {
            that.dialogSubmitBtnLoading = false;
            console.log(JSON.stringify(error));
          });
      }
    },
    beforeAvatarUpload(file) {
      // 通过split方法和fileArr方法获取到文件的后缀名
      let fileArr = file.name.split(".");
      let suffix = fileArr[fileArr.length - 1];
      //只能导入.xls和.xlsx文件
      if (!/(xls|xlsx)/i.test(suffix)) {
        this.$message("文件格式不正确");
        return false;
      }

      //不能导入大小超过2Mb的文件
      if (file.size > 2 * 1024 * 1024) {
        this.$message("文件过大，请上传小于2MB的文件〜");
        return false;
      }
      return true;
    },

    uploadByJsqd(file) {
      if (this.beforeAvatarUpload(file)) {
        const readAsBinaryString = new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsBinaryString(file.raw);
          reader.onload = (ev) => {
            try {
              const dataBinary = ev.target.result;
              const workBook = XLSX.read(dataBinary, {
                type: "binary",
                cellDates: true,
              });
              const workSheet = workBook.Sheets[workBook.SheetNames[0]];
              const params = XLSX.utils.sheet_to_json(workSheet, {
                header: ["employNum", "name", "machine", "time"],
                range: 1,
              });
              importDevice(params).then((res) => {
                if (res.code === 20000) {
                  this.$message.success("导入成功!");
                  that.requestList();
                } else {
                  this.$message.error(res.msg);
                }
              });
              resolve(params);
            } catch (err) {
              reject(err);
            }
          };
          reader.onerror = (err) => {
            reject(err);
          };
        });

        readAsBinaryString
          .then((data) => {
            console.log("data", data);
          })
          .catch((err) => {
            console.log(err);
          });
      }
    },
    getBgColor(row) {
      return row.status === 2 ? "#E6A23C" : "#67C23A";
    },
  },
};
</script>

<style lang="scss" scoped>
// ::v-deep .el-form-item {
//   background-color: white !important;
// }
</style>



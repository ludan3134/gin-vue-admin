<template>
  <div class="spp-theme-body spp-theme-pad">
    <Hamburger />

    <!-- 列表查询条件 -->
    <el-form
      :inline="true"
      size="small"
      :model="tableSearchParams"
      class="spp-form-search spp-theme-top"
    >
      <el-form-item>
        <el-input
          v-model="queryParams.name"
          maxlength="20"
          placeholder="请输入部门名称"
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
    </el-form>

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
        <el-table-column type="selection" width="55" :selectable="isEditable" />
        <el-table-column prop="name" label="部门名称" width="200" />

        <el-table-column label="上午上班打卡时间" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.clickInTime[0]) }}
          </template>
        </el-table-column>
        <el-table-column label="上午下班打卡时间" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.clickInTime[1]) }}
          </template>
        </el-table-column>
        <el-table-column label="下午上班打卡时间" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.clickOutTime[0]) }}
          </template>
        </el-table-column>
        <el-table-column label="下午下班打卡时间" width="200">
          <template slot-scope="scope">
            {{ formatTime(scope.row.clickOutTime[1]) }}
          </template>
        </el-table-column>
        <el-table-column prop="overview" label="部门介绍" />
        <el-table-column prop="total" label="部门总人数" />

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

    <!-- 新增 编辑弹框 -->
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
          <el-form-item label="部门名称:" prop="v1">
            <el-input
              v-model="dialogFormData.name"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item label="部门介绍:" prop="v1">
            <el-input
              v-model="dialogFormData.overview"
              placeholder="请输入"
              clearable
            />
          </el-form-item>
          <el-form-item label="上午打卡时间:" prop="v1">
            <el-time-picker
              is-range
              v-model="dialogFormData.clickInTime"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
            >
            </el-time-picker>
          </el-form-item>
          <el-form-item label="下午打卡时间:" prop="v1">
            <el-time-picker
              is-range
              v-model="dialogFormData.clickOutTime"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
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
import * as checkUtils from "@/utils/checkUtils";
import { REGEX_phone } from "@/utils/checkUtils";
import Pagination from "@/components/Pagination";
import Hamburger from "@/components/Hamburger/index2";
import { getDictList, upsetDept, deleteDept } from "@/api/system/dict";

export default {
  components: {
    Pagination,
    Hamburger,
  },
  data() {
    return {
      tableLoading: false,
      tableData: [],
      tableTotal: 0, // 默认数据总数
      tableSizes: this.pageGroup.sizes, // 显示条数分组
      selectionList: [], // 勾选一行或多行数据
      queryParams: {
        page: 1,
        limit: this.pageGroup.size,
        name: "",
      },

      // 弹框相关
      dialogTitle: "",
      isShowDialog: false,
      dialogSubmitBtnLoading: false,
      dialogIsLook: false,
      dialogFormData: {
        name: "",
        clickInTime: [
          new Date(2016, 9, 10, 8, 40),
          new Date(2016, 9, 10, 9, 40),
        ],
        clickOutTime: [
          new Date(2016, 9, 10, 8, 40),
          new Date(2016, 9, 10, 9, 40),
        ],
      },
      roleOptions: [],
      dialogRules: {
        name1: [
          { required: true, message: "请输入", trigger: "blur" },
          { min: 1, max: 10, message: "10字符以内", trigger: "blur" },
        ],
        content: [
          { required: false, message: "请输入", trigger: "blur" },
          { min: 1, max: 100, message: "100字符以内", trigger: "blur" },
        ],
        level: [{ required: true, message: "请选择", trigger: "blur" }],
        createDate: [{ required: true, message: "请选择", trigger: "blur" }],
        updateDate: [{ required: true, message: "请选择", trigger: "blur" }],
        status: [{ required: true, message: "请选择", trigger: "blur" }],
        isUse: [{ required: true, message: "请选择", trigger: "blur" }],
        phone: [
          { required: true, message: "请输入", trigger: "blur" },
          { pattern: REGEX_phone, message: "请输入正确手机号" },
        ],
        money: [
          { required: true, message: "请输入", trigger: "blur" },
          {
            pattern: checkUtils.REGEX_money,
            message: "请输入最多两位小数金额",
          },
        ],
        age: [
          { required: true, message: "请输入", trigger: "blur" },
          { pattern: /^[1-9]\d*$/, message: "仅支持录入正整数" },
        ],
      },
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
    formatTime(time) {
      if (time) {
        const date = new Date(time);
        return (
          date.getHours().toString().padStart(2, "0") +
          ":" +
          date.getMinutes().toString().padStart(2, "0") +
          ":" +
          date.getSeconds().toString().padStart(2, "0")
        );
      }
      return "";
    },
    // 加载列表数据
    requestList() {
      var that = this;
      var params = JSON.parse(JSON.stringify(this.queryParams));
      console.log(JSON.stringify(params));
      // this.tableLoading = true
      getDictList(params)
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

    // 页容量改变时会触发
    handleSizeChange(size) {
      this.tableSearchParams.page = 1;
      this.tableSearchParams.limit = size;
      this.requestList();
    },
    // 当前页改变时会触发
    handleCurrentChange(currentPage) {
      this.tableSearchParams.page = currentPage;
      this.requestList();
    },
    onSelectionChange(val) {
      this.selectionList = val;
    },
    // 操作按钮
    onAdd() {
      this.dialogFormData = {
        name: "",
      };
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
      if (this.selectionList.length === 0) {
        var params = {
          name1: "",
          time: "",
          level: "",
          page: 1,
          limit: this.tableTotal,
        };
        var _this = this;
        getListData(params)
          .then((response) => {
            const { data } = response;
            _this.handelExcel(data);
          })
          .catch((error) => {
            console.log(JSON.stringify(error));
          });
      } else {
        this.handelExcel(this.selectionList);
      }
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    onClickDelete(row) {
      var name = "";
      if (row && row.id) {
        name = row.userName;
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
          var idBySelected = Number(row.id);
          params.ids = [idBySelected];
        } else {
          params.ids = this.selectionList.map((item) => Number(item.id));
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
    // 行内处理
    onHandle(row) {
      console.log(JSON.stringify(row));
      var that = this;
      getDataById(row.id)
        .then((res) => {
          if (res.code === 20000) {
            that.dialogTitle = "查看";
            that.dialogIsLook = true;
            that.handelDialogSetData(res.data);
            that.isShowDialog = true;
          } else {
            that.$message.error(res.msg);
          }
        })
        .catch((error) => {
          console.log(JSON.stringify(error));
        });
    },

    // 行编辑
    rowEdit(row) {
      console.log(JSON.stringify(row));
      this.dialogTitle = "编辑";
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
      deleteDept(params)
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
      params.id = Number(params.id);
      // console.log(JSON.stringify(params))

      if (this.dialogTitle === "新增") {
        upsetDept(params)
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
        upsetDept(params)
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
  },
};
</script>

<style lang="scss" scoped>
// ::v-deep .el-form-item {
//   background-color: white !important;
// }
</style>

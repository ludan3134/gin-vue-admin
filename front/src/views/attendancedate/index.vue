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
      <!-- <el-form-item>
        <el-date-picker
          v-model="queryParams.date"
          type="date"
          placeholder="选择日期"
        >
        </el-date-picker>
      </el-form-item> -->
      <el-form-item prop="deptId">
        <el-select
          v-model="queryParams.deptId"
          filterable
          placeholder="请选择部门"
          collapse-tags
          clearable
        >
          <el-option
            v-for="item in deptOptions"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          />
        </el-select>
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

        <el-table-column prop="date" label="打卡日期">
          <template slot-scope="scope">
            {{ scope.row.date }}
          </template>
        </el-table-column>
        <!-- 这是部门 -->
        <el-table-column label="部门" width="66">
          <!-- <template slot-scope="scope">
            {{ scope.row.deptId }}
          </template> -->
          <template slot-scope="scope">
            <div
              :style="{ background: getDeptColor(scope.row) }"
              class="tagClass"
            >
              {{ scope.row.deptId === "1" ? "研发" : "其他" }}
            </div>
          </template>
        </el-table-column>

        <el-table-column label="是否上班" width="55">
          <template slot-scope="scope">
            <div
              :style="{ background: getBgColor(scope.row) }"
              class="tagClass"
            >
              {{ scope.row.IsOnWork ? "是" : "否" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="clickInTime" label="上午上班打卡时间">
          <template slot-scope="scope">
            <!-- {{ scope.row.clickInTime[0] }} -->
            {{ scope.row.clickInTime[0] }}
            <---->
            {{ scope.row.clickInTime[1] }}
          </template>
        </el-table-column>
        <el-table-column prop="clickOutTime" label="下午上班打卡时间">
          <template slot-scope="scope">
            {{ scope.row.clickOutTime[0] }}
            <---->
            {{ scope.row.clickOutTime[1] }}
          </template>
        </el-table-column>
        <!-- <el-table-column prop="isLate" label="是否迟到" /> -->

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
          <el-form-item label="打卡日期:" prop="date">
            <el-date-picker
              v-model="dialogFormData.date"
              align="right"
              type="date"
              placeholder="选择日期"
              :picker-options="pickerOptions"
              value-format="yyyy-MM-dd"
            >
            </el-date-picker>
          </el-form-item>
          <el-form-item label="上午打卡时间:" prop="clickInTime">
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
          <el-form-item label="下午打卡时间:" prop="clickOutTime">
            <el-time-picker
              is-range
              v-model="dialogFormData.clickOutTime"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              placeholder="选择时间范围"
              value-format="HH:mm:ss"
              :picker-options="{
                start: '12:00',
                step: '00:30',
                end: '18:00',
              }"
            >
            </el-time-picker>
          </el-form-item>
          <el-form-item label="部门:" prop="deptId">
            <el-select
              v-model="dialogFormData.deptId"
              filterable
              placeholder="请选择部门"
              collapse-tags
              clearable
            >
              <el-option
                v-for="item in deptOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="是否上班:" prop="IsOnWork">
            <el-radio-group v-model="dialogFormData.IsOnWork">
              <el-radio :label="true">是</el-radio>
              <el-radio :label="false">否</el-radio>
            </el-radio-group>
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
import Pagination from "@/components/Pagination";
import Hamburger from "@/components/Hamburger/index2";
import {
  getAttendanceDateList,
  editAttendanceDate,
  deleteAttendanceDate,
} from "@/api/attendance/attendancedate";
import { getDictList } from "@/api/system/dict";

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
        date: "",
      },
      // 弹框相关
      dialogTitle: "",
      isShowDialog: false,
      dialogSubmitBtnLoading: false,
      dialogIsLook: false,
      dialogFormData: {
        clickInTime: [
          new Date(2016, 9, 10, 9, 0), // 早上 9:00
          new Date(2016, 9, 10, 12, 0), // 中午 12:00
        ],
        ClickOutTime: [
          new Date(2016, 9, 10, 8, 40),
          new Date(2016, 9, 10, 9, 40),
        ],
        date: "",
        isOnWork: true,
        deptId: "",
      },
      pickerOptions: {
        shortcuts: [
          {
            text: "今天",
            onClick(picker) {
              picker.$emit("pick", new Date());
            },
          },
          {
            text: "昨天",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit("pick", date);
            },
          },
          {
            text: "一周前",
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", date);
            },
          },
        ],
      },
      dialogRules: {},
      selectId: "",
      deptOptions: [],
    };
  },
  created() {
    this.requestDictDept();
  },
  mounted() {
    this.requestList();
  },
  methods: {
    // 搜索列表
    onSearch() {
      this.queryParams.page = 1;
      this.requestList();
    },
    requestDictDept() {
      var params = JSON.parse(JSON.stringify(this.queryParams));
      console.log(JSON.stringify(params));

      getDictList(params).then((res) => {
        if (res.code === 20000) {
          this.deptOptions = res.data.list;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    // 加载列表数据
    requestList() {
      var that = this;
      var params = JSON.parse(JSON.stringify(this.queryParams));
      console.log(JSON.stringify(params));
      // this.tableLoading = true
      getAttendanceDateList(params)
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
    getName(value, data) {
      var tempData = data;
      for (var i = 0; i < tempData.length; i++) {
        if (tempData[i].value === value) {
          return tempData[i].label;
        }
      }
    },
    onSelectionChange(val) {
      this.selectionList = val;
    },
    // 操作按钮
    onAdd() {
      const formatTime = (hour, minute, second) => {
        const date = new Date();
        date.setHours(hour + 8, minute, second, 0);
        return date.toISOString().substr(11, 8); // 返回格式为 "HH:mm:ss" 的字符串
      };

      this.dialogFormData = {
        clickInTime: [
          formatTime(9, 0, 0), // 默认早上 9:00
          formatTime(12, 0, 0), // 默认中午 12:00
        ],
        clickOutTime: [
          formatTime(12, 0, 0), // 默认下午 1:00
          formatTime(18, 0, 0), // 默认下午 6:00
        ],
        date: "", // 这里您可以设置为当前日期的字符串，例如 new Date().toISOString().substr(0, 10)
        isOnWork: true,
        deptId: "",
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
    formatJson(filterVal, jsonData) {
      return jsonData.map((v) => filterVal.map((j) => v[j]));
    },
    onClickDelete(row) {
      var date = "";
      if (row && row.id) {
        date = row.date;
      } else {
        date = this.selectionList.map((item) => item.date).join(",");
      }
      this.$confirm(
        `确定要删除日期 ${date} ，此操作将永久删除, 是否继续?`,
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
      deleteAttendanceDate(params)
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
      // console.log(JSON.stringify(params))

      if (this.dialogTitle === "新增") {
        editAttendanceDate(params)
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
        editAttendanceDate(params)
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
    getBgColor(row) {
      return row.IsOnWork === false ? "#E6A23C" : "#67C23A";
    },
    getDeptColor(row) {
      return row.deptId === "1" ? "#E6A23C" : "#67C23A";
    },
  },
};
</script>

<style lang="scss" scoped>
// ::v-deep .el-form-item {
//   background-color: white !important;
// }
</style>



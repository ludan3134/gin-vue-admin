<template>
  <div class="bs-page-body">
    <Hamburger />
    <el-form
      :inline="true"
      size="small"
      :model="queryParams"
      class="bs-form-search mt10"
    >
      <el-form-item>
        <span class="bs-form-label" style="width: 80px">
          <i class="icon">姓名:</i>
        </span>
        <el-input
          v-model="queryParams.name"
          maxlength="20"
          placeholder="请输入姓名"
          clearable
          @keyup.enter.native="onSearch"
        />
      </el-form-item>
      <el-form-item>
        <span class="bs-form-label" style="width: 80px">
          <i class="icon">部门:</i>
        </span>
        <el-select
          v-model="queryParams.deptId"
          placeholder="请选择"
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
          class="bs-form-btn"
          size="small"
          type="primary"
          @click="onSearch"
          >查询</el-button
        >
      </el-form-item>
    </el-form>
    <div class="bs-page-table">
      <div class="bs-table-btns">
        <el-button
          v-permission="{ action: 'user-add' }"
          size="small"
          type="primary"
          icon="el-icon-plus"
          @click="onClickAdd"
        >
          新增
        </el-button>
        <el-button
          v-permission="{ action: 'user-edit' }"
          size="small"
          type="primary"
          icon="el-icon-edit"
          :disabled="selectedRows.length !== 1"
          @click="onClickEdit"
        >
          编辑
        </el-button>
        <el-button
          v-permission="{ action: 'user-look' }"
          size="small"
          type="primary"
          icon="el-icon-search"
          :disabled="selectedRows.length !== 1"
          @click="onClickLook"
        >
          查看
        </el-button>
        <el-button
          v-permission="{ action: 'user-delete' }"
          size="small"
          type="danger"
          icon="el-icon-delete"
          :disabled="selectedRows.length == 0"
          @click="onClickDelete"
        >
          删除
        </el-button>
        <el-button
          v-permission="{ action: 'user-assign' }"
          size="small"
          type="warning"
          icon="el-icon-setting"
          :disabled="selectedRows.length !== 1"
          @click="onClickAssignRole"
        >
          角色分配
        </el-button>
      </div>
      <el-table
        ref="tableRef"
        v-loading="tableLoading"
        class="bs-table"
        :data="tableData"
        :stripe="true"
        :header-cell-style="{ textAlign: 'center' }"
        :cell-style="{ textAlign: 'center' }"
        @selection-change="onSelectionChange"
      >
        <el-table-column prop="number" type="index" label="序号" />
        <el-table-column type="selection" width="55" :selectable="isEditable" />
        <el-table-column label="姓名" width>
          <template slot-scope="scope">
            <span @click="onClickRow(scope.row)">
              <a style="color: #00a0e9; text-decoration: underline">{{
                scope.row.userName
              }}</a>
            </span>
          </template>
        </el-table-column>
        <el-table-column label="角色">
          <template slot-scope="scope">
            <el-tag
              v-for="role in scope.row.roles"
              :key="role.id"
              class="mr-10"
              size="small"
              >{{ role.name }}</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="电话" min-width="180" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="deptName" label="部门" min-width="180" />
        <el-table-column label="状态">
          <template slot-scope="scope">
            <div
              :style="{ background: getBgColor(scope.row) }"
              class="tagClass"
            >
              {{ scope.row.enable === 1 ? "启用" : "停用" }}
            </div>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" width="180">
          <template slot-scope="scope">
            <el-button
              v-permission="{ action: 'user-edit' }"
              size="mini"
              icon="el-icon-edit-outline"
              :disabled="!isEditable(scope.row)"
              @click="onClickEdit(scope.row)"
            />
            <el-button
              v-permission="{ action: 'user-delete' }"
              size="mini"
              icon="el-icon-delete"
              type="danger"
              :disabled="!isEditable(scope.row)"
              @click="onClickDelete(scope.row)"
            />
            <el-button
              v-permission="{ action: 'user-resetPwd' }"
              size="mini"
              icon="el-icon-refresh-left"
              type="danger"
              :disabled="!isEditable(scope.row)"
              @click="onClickReset(scope.row)"
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
    <AddDialog
      :dialog-type="dialogType"
      :is-show.sync="isShowDialog"
      :dialog-data="dialogFormData"
      @success="requestList"
      @closed="onClosedDialog"
    />
    <AssignRoleDialog
      :is-show.sync="isShowDialogAssignRole"
      :dialog-data="assignRoleUserData"
      @success="requestList"
    />
  </div>
</template>

<script>
import { getDictList } from "@/api/system/dict";
import { getUserList, deleteUser, resetPwd } from "@/api/system/user";
import Pagination from "@/components/Pagination";
import Hamburger from "@/components/Hamburger/index2";
import AddDialog from "./addDialog";
import AssignRoleDialog from "./assignRoleDialog";

export default {
  components: {
    Pagination,
    Hamburger,
    AddDialog,
    AssignRoleDialog,
  },
  data() {
    return {
      tableTotal: 0,
      tableLoading: false,
      tableData: [],
      queryParams: {
        page: 1,
        limit: this.pageGroup.size,
        userName: "",
        deptId: "",
      },
      selectedRows: [], // 勾选一行或多行数据
      deptOptions: [],
      isShowDialog: false,
      dialogType: "",
      dialogFormData: {},
      isShowDialogAssignRole: false,
      assignRoleUserData: {},
    };
  },
  created() {
    this.requestDict();
    this.requestList();
  },
  methods: {
    requestDict() {
      var queryparams = { page: 0, limit: 10000 };
      var params = JSON.parse(JSON.stringify(queryparams));

      getDictList(params).then((res) => {
        if (res.code === 20000) {
          this.deptOptions = res.data.list;
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    requestList() {
      var params = JSON.parse(JSON.stringify(this.queryParams));
      console.log(JSON.stringify(params));
      this.tableLoading = true;
      getUserList(params)
        .then((res) => {
          this.tableLoading = false;
          if (res.code === 20000) {
            this.tableData = res.data.list;
            this.tableTotal = res.data.total;
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((error) => {
          this.tableLoading = false;
          console.log(JSON.stringify(error));
        });
    },
    onSearch() {
      this.queryParams.page = 1;
      this.requestList();
    },
    isEditable: function (row) {
      return !row.userName.toLowerCase().includes("admin");
    },
    onSelectionChange(val) {
      this.selectedRows = val;
    },
    getBgColor(row) {
      return row.enable === 1 ? "#E6A23C" : "#67C23A";
    },
    // 操作按钮
    onClickAdd() {
      this.dialogType = "add";
      this.dialogFormData = {}; // 新增使用的内部初始值
      this.isShowDialog = true;
    },
    onClickEdit(row) {
      const params = JSON.parse(
        JSON.stringify(row && row.ID ? row : this.selectedRows[0])
      );
      this.dialogType = "edit";
      this.dialogFormData = params;
      this.isShowDialog = true;
    },
    onClickLook(row) {
      const params = JSON.parse(
        JSON.stringify(row && row.id ? row : this.selectedRows[0])
      );
      this.dialogType = "look";
      this.dialogFormData = params;
      this.isShowDialog = true;
    },
    onClickDelete(row) {
      var name = "";
      if (row && row.ID) {
        name = row.userName;
      } else {
        name = this.selectedRows.map((item) => item.userName).join(",");
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
        if (row && row.ID) {
          params.ids = [row.ID];
        } else {
          params.ids = this.selectedRows.map((item) => item.ID);
        }
        this.deleteRequest(params);
      });
    },
    deleteRequest(params) {
      console.log(JSON.stringify(params));
      deleteUser(params).then((res) => {
        if (res.code === 20000) {
          this.$message.success("删除成功!");
          this.requestList();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    onClickAssignRole() {
      console.log("我是selectRows", this.selectedRows);
      this.assignRoleUserData = JSON.parse(
        JSON.stringify(this.selectedRows[0])
      );
      this.isShowDialogAssignRole = true;
    },
    onClickRow(row) {
      this.dialogType = "look";
      console.log("row", row);
      this.dialogFormData = JSON.parse(JSON.stringify(row));
      this.isShowDialog = true;
    },
    // 行操作
    onClickReset(row) {
      this.$confirm(`确定要重置 ${row.userName} 的密码, 是否继续 ?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        const params = { id: row.ID };
        this.resetRequest(params);
      });
    },
    resetRequest(params) {
      console.log(JSON.stringify(params));
      resetPwd(params).then((res) => {
        if (res.code === 20000) {
          this.$message.success("重置密码成功!");
          this.requestList();
        } else {
          this.$message.error(res.msg);
        }
      });
    },
    onClosedDialog() {
      this.$refs.tableRef.clearSelection();
    },
  },
};
</script>

<style lang="scss" scoped>
.tagClass {
  display: inline-block;
  padding: 5px 10px;
  font-size: 12px;
  color: white;
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
  word-break: break-word;
}

.b-tag-warning {
  display: inline-block;
  margin: 0.2rem;
  padding: 5px 10px;
  font-size: 12px;
  color: #ffba00;
  background: #fff8e6;
  border: 1px solid #fff1cc;
  border-radius: 4px;
}

.b-tag-error {
  display: inline-block;
  margin: 0.2rem;
  padding: 5px 10px;
  font-size: 12px;
  color: #ff4949;
  background: #ffeded;
  border: 1px solid #ffdbdb;
  border-radius: 4px;
}

.b-tag-success {
  display: inline-block;
  margin: 0.2rem;
  padding: 5px 10px;
  font-size: 12px;
  color: #13ce66;
  background: #e7faf0;
  border: 1px solid #d0f5e0;
  border-radius: 4px;
}
.mr-10 {
  margin-right: 10px;
}
</style>

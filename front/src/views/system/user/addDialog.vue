<template>
  <div>
    <el-dialog
      :title="dialogTitle"
      :visible.sync="isShowDialog"
      top="8vh"
      width="55%"
      :close-on-click-modal="false"
      @opened="onOpenedDialog"
      @closed="onClosedDialog"
    >
      <div class="bs-dialog input-width">
        <el-form
          ref="dialogFormRef"
          :model="dialogFormData"
          :inline="true"
          :rules="dialogFormRules"
          label-width="120px"
          size="small"
          :disabled="dialogIsLook"
        >
          <el-form-item label="姓名:" prop="name">
            <el-input
              v-model="dialogFormData.userName"
              placeholder="请输入姓名"
              clearable
            />
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
          <el-form-item label="手机号:" prop="phone">
            <el-input
              v-model="dialogFormData.phone"
              placeholder="请输入手机号"
              clearable
            />
          </el-form-item>
          <el-form-item label="邮箱:" prop="email">
            <el-input
              v-model="dialogFormData.email"
              placeholder="请输入邮箱"
              clearable
            />
          </el-form-item>
          <el-form-item label="状态:" prop="enale">
            <el-radio-group v-model="dialogFormData.enable">
              <el-radio :label="1">启用</el-radio>
              <el-radio :label="2">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div v-if="!dialogIsLook" slot="footer" class="bs-dialog-footer">
          <el-button size="small" @click="isShowDialog = false">
            取消
          </el-button>
          <el-button
            :loading="dialogSubmitBtnLoading"
            size="small"
            type="primary"
            @click="onDialogSubmit()"
          >
            保存
          </el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getDictDept } from "@/api/base/base";
import { addUser, editUser, saveUser } from "@/api/system/user";
import { REGEX_phone, REGEX_email } from "@/utils/checkUtils";
import { getDictList } from "@/api/system/dict";

export default {
  components: {},
  props: {
    // 是否显示
    isShow: { type: Boolean, default: false },
    // add，edit，look
    dialogType: { type: String, default: "add" },
    // 传参
    dialogData: { type: Object, default: () => ({}) },
    // 标题：默认按类型设置为新增、编辑、查看，传值优先级更高
    title: { type: String, default: "" },
  },
  data() {
    return {
      // 弹框相关
      dialogTitle: "提示",
      isShowDialog: false,
      dialogSubmitBtnLoading: false,
      dialogIsLook: false,
      dialogFormData: {
        userName: "",
        email: "",
        deptId: "",
        phone: "",
        enable: 0,
      },
      queryParams: {
        page: 0,
        limit: 10000,
      },
      initFormData: {},
      dialogFormRules: {
        username: [
          { required: true, message: "请输入", trigger: ["blur", "change"] },
          {
            min: 1,
            max: 10,
            message: "10字符以内",
            trigger: ["blur", "change"],
          },
        ],
        deptId: [
          { required: true, message: "请选择", trigger: ["blur", "change"] },
        ],
        status: [
          { required: true, message: "请选择", trigger: ["blur", "change"] },
        ],
        phone: [
          { required: true, message: "请输入", trigger: "blur" },
          { pattern: REGEX_phone, message: "请输入正确手机号" },
        ],
        email: [
          {
            required: true,
            message: "请输入邮箱",
            trigger: ["blur", "change"],
          },
          { pattern: REGEX_email, message: "请输入正确的邮箱格式" },
        ],
      },
      // 字典项
      deptOptions: [],
    };
  },
  watch: {
    isShow: function (val) {
      this.isShowDialog = val; // isShow改变是同步子组件isShowDialog的值
    },
    isShowDialog: function (val) {
      this.$emit("update:isShow", val); // isShowDialog改变时同步父组件isShow的值
    },
    title: function (val) {
      this.dialogTitle = val.length ? val : this.dialogTitle;
    },
    dialogData: function (val) {
      if (this.dialogType === "add") {
        // 新增使用的初始值
        this.dialogFormData = JSON.parse(JSON.stringify(this.initFormData));
      } else {
        this.dialogFormData = JSON.parse(JSON.stringify(val));
      }
    },
    dialogType: function (val) {
      this.dialogTitle =
        this.title ||
        (val === "add"
          ? "新增"
          : val === "edit"
          ? "编辑"
          : val === "look"
          ? "查看"
          : this.dialogTitle);
      this.dialogIsLook = val === "look";
    },
  },
  created() {
    this.initFormData = JSON.parse(JSON.stringify(this.dialogFormData));
    this.requestDictDept();
  },
  methods: {
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
    // 弹框相关
    onOpenedDialog() {
      if (this.dialogType === "add") {
        this.$refs["dialogFormRef"].clearValidate(); // 清空校验
      }
      if (!this.deptOptions.length) {
        this.requestDictDept();
      }
      if (!this.levelOptions.length) {
        this.requestDictLevel();
      }
    },
    onClosedDialog() {
      if (!this.dialogIsLook) {
        this.$refs["dialogFormRef"].resetFields(); // 仅清除验证
      }
      this.$emit("closed", {});
    },
    onDialogSubmit() {
      this.$refs["dialogFormRef"].validate((valid) => {
        if (valid) {
          this.submitRequest();
        }
      });
    },
    submitRequest() {
      const params = JSON.parse(JSON.stringify(this.dialogFormData));
      console.log(JSON.stringify(params));
      const msg = this.dialogType === "add" ? "新增成功!" : "编辑成功!";
      this.dialogSubmitBtnLoading = true;
      saveUser(params)
        .then((res) => {
          this.dialogSubmitBtnLoading = false;
          if (res.code === 20000) {
            this.$message.success(msg);
            this.isShowDialog = false;
            this.$emit("success", {});
          } else {
            this.$message.error(res.msg);
          }
        })
        .catch((error) => {
          this.dialogSubmitBtnLoading = false;
          console.log(JSON.stringify(error));
        });
    },
  },
};
</script>

<style lang="scss" scoped>
$inputWidth: null;
// $inputWidth: 300px;

.input-width ::v-deep .el-form-item__content {
  width: $inputWidth;
}
.input-width ::v-deep .el-input .el-input__inner {
  width: $inputWidth;
}

.input-width ::v-deep .el-form-item__content .el-input {
  width: $inputWidth;
}

.input-width ::v-deep .el-textarea {
  width: $inputWidth;
}
</style>

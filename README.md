# gin- vue-admin
这是一个基于Gin / Vue-admin-template 进行开发的系统后台管理系统,囊括了基本的用户角色权限,主要负责导入指定格式考勤Excel数据并进行业务需求的处理,进行格式化导出Excel功能.

## 功能特点
- **carbon 处理时间**：在处理考勤数据方面,做了很多业务上的洽谈和思考,选用Cabon处理了各种复杂的时间处理..
- **excelize/v2导入导出**：在导出数据格式方面,需要根据业务需求导出指定的样式.这个项目做了一些基本的示范..
- **权限控制**：在前端方面,使用传统的vue解决方案控制路由按钮颗粒度的用户权限.这些无须赘述.在后台方面,使用casbin进行接口权限控制,但在这个项目只是基本的使用.

## 安装运行
```bash
# 克隆项目
git https://github.com/ludan3134/gin-vue-admin.git

# 前端
# 进入项目目录
cd front

# 安装依赖
npm install

# 建议不要直接使用 cnpm 安装以来，会有各种诡异的 bug。可以通过如下操作解决 npm 下载速度慢的问题
npm install --registry=https://registry.npm.taobao.org

# 启动服务# 
npm run start

# 前端
# 进入项目目录
cd server

# 本地运行
go run main.go
```

## 项目结构

```
# 后端项目结构

│  attendance_records.xlsx
│  config.yaml
│  go.mod
│  go.sum
│  main.go
│  tr.txt
│  
├─.idea
│      .gitignore
│      go.imports.xml
│      modules.xml
│      server.iml
│      workspace.xml
│      
├─api 
│  └─v1
│      │  enter.go
│      │  
│      ├─attendance
│      │      attendance.go
│      │      attendancedate.go
│      │      enter.go
│      │      
│      └─system
│              enter.go
│              sys_base.go
│              sys_cabin.go
│              sys_dept.go
│              sys_menu.go
│              sys_role.go
│              sys_user.go
│              
├─config 
│      auto_code.go
│      captcha.go
│      config.go
│      db_list.go
│      gorm_mysql.go
│      jwt.go
│      redis.go
│      system.go
│      zap.go
│      
├─core
│  │  server.go
│  │  server_other.go
│  │  server_win.go
│  │  viper.go
│  │  zap.go
│  │  
│  └─internal
│          constant.go
│          cutter.go
│          zap_core.go
│          
├─docs
├─global (全局配置)
│      excelstyle.go
│      global.go
│      mode.go
│      
├─initialize (初始化配置)
│      excelstyle.go
│      gorm_logger_writer.go
│      gorm_mysql.go
│      redis.go
│      router.go
│      
├─log
│          
├─middleware
│      casbin_rbac.go
│      jwt.go
│      
├─model (实体层)
│  ├─attendance
│  │  │  attendancedate.go
│  │  │  attendancedept.go
│  │  │  attendancerecord.go
│  │  │  attendancesummary.go
│  │  │  initialrecord.go
│  │  │  
│  │  ├─request
│  │  │      attendance.go
│  │  │      
│  │  └─response
│  ├─common
│  │  │  clearDB.go
│  │  │  
│  │  ├─request
│  │  │      common.go
│  │  │      
│  │  └─response
│  │          common.go
│  │          response.go
│  │          
│  └─system	
│      │  sys_casbin.go
│      │  sys_dept.go
│      │  sys_menu.go
│      │  sys_role.go
│      │  sys_user.go
│      │  
│      ├─request
│      │      jwt.go
│      │      sys_casbin.go
│      │      sys_init.go
│      │      sys_menu.go
│      │      sys_role.go
│      │      sys_user.go
│      │      
│      └─response
│              sys_dept.go
│              sys_menu.go
│              sys_user.go
│              
├─packfile
├─plugin
│  └─.idea
│          .gitignore
│          modules.xml
│          plugin.iml
│          workspace.xml
│          
├─resource
├─router	
│  │  enter.go
│  │  
│  ├─attendance
│  │      attence.go
│  │      enter.go
│  │      
│  └─system	(路由转发)
│          enter.go
│          sys_base.go
│          sys_casbin.go
│          sys_dpet.go
│          sys_menu.go
│          sys_role.go
│          sys_user.go
│          
├─service	(服务层)
│  │  enter.go
│  │  
│  ├─attendace
│  │      attendance.go
│  │      attendancedate.go
│  │      enter.go
│  │      
│  └─system
│          enter.go
│          jwt_black_list.go
│          sys_casbin.go
│          sys_dept.go
│          sys_menu.go
│          sys_role.go
│          sys_user.go
│          
├─source
├─task 
└─utils	(工具类)
        clamis.go
        directory.go
        hash.go
        human_duration.go
        jwt.go
        


# 前端项目结构

│  App.vue
│  main.js
│  permission.js
│  settings.js
│  tr.txt
│  
├─api 
│  │  table.js
│  │  user.js
│  │  
│  ├─attendance
│  │      attendance.js
│  │      attendancedate.js
│  │      
│  ├─base
│  │      base.js
│  │      
│  └─system
│          casbin.js
│          dict.js
│          menu.js
│          role.js
│          user.js
│          
├─assets
│  ├─401_images
│  │      401.gif
│  │      
│  ├─404_images
│  │      404.png
│  │      404_cloud.png
│  │      
│  └─custom-theme
│      │  index.css
│      │  
│      └─fonts
│              element-icons.ttf
│              element-icons.woff
│              
├─components
│  ├─Breadcrumb
│  │      index.vue
│  │      
│  ├─Hamburger
│  │      index.vue
│  │      index2.vue
│  │      
│  ├─LangSelect
│  │      index.vue
│  │      
│  ├─Pagination
│  │      index.vue
│  │      
│  └─SvgIcon
│          index.vue
│          
├─directive
│  │  sticky.js
│  │  
│  ├─clipboard
│  │      clipboard.js
│  │      index.js
│  │      
│  ├─el-drag-dialog
│  │      drag.js
│  │      index.js
│  │      
│  ├─el-table
│  │      adaptive.js
│  │      index.js
│  │      
│  ├─permission
│  │      index.js
│  │      permission.js
│  │      
│  └─waves
│          index.js
│          waves.css
│          waves.js
│          
├─icons
│  │  index.js
│  │  svgo.yml
│  │  
│  └─svg
│          404.svg
│          bug.svg
│          chart.svg
│          clipboard.svg
│          component.svg
│          
├─lang
│      en.js
│      es.js
│      index.js
│      ja.js
│      zh.js
│      
├─layout
│  │  index.vue
│  │  
│  ├─components
│  │  │  AppMain.vue
│  │  │  index.js
│  │  │  Navbar.vue
│  │  │  
│  │  ├─Sidebar
│  │  │      FixiOSBug.js
│  │  │      index.vue
│  │  │      Item.vue
│  │  │      Link.vue
│  │  │      Logo.vue
│  │  │      SidebarItem.vue
│  │  │      
│  │  └─TagsView
│  │          index.vue
│  │          ScrollPane.vue
│  │          
│  └─mixin
│          ResizeHandler.js
│          
├─router (路由请求)
│  │  index.js
│  │  
│  └─modules
│          components.js
│          nested.js
│          system.js
│          table.js
│          
├─store	(全局设置变量)
│  │  getters.js
│  │  index.js
│  │  
│  └─modules
│          app.js
│          permission.js
│          settings.js
│          tagsView.js
│          user.js
│          
├─styles
│  │  btn.scss
│  │  element-ui.scss
│  │  element-variables.scss
│  │  index.scss
│  │  mixin.scss
│  │  sidebar.scss
│  │  transition.scss
│  │  variables.scss
│  │  
│  └─custom
│          base.scss
│          global.css
│          style.scss
│          
├─utils	(工具)
│      auth.js
│      checkUtils.js
│      get-page-title.js
│      i18n.js
│      index.js
│      permission.js
│      request.js
│      scroll-to.js
│      timeUtils.js
│      validate.js
│      
├─vendor
│      Blob.js
│      Export2Excel.js
│      Print.js
│      Printarea.js
│      
└─views	(视图层)
    ├─attendance
    │      index.vue
    │      
    ├─attendancedate
    │      index.vue
    │      
    ├─components
    │  └─select-tree
    │          index.vue
    │          
    ├─dashboard
    │      index.vue
    │      
    ├─error-log
    │  │  index.vue
    │  │  
    │  └─components
    │          ErrorTestA.vue
    │          ErrorTestB.vue
    │          
    ├─error-page
    │      401.vue
    │      404.vue
    │      
    ├─form
    │      index.vue
    │      
    ├─login
    │      auth-redirect.vue
    │      index.vue
    │      
    ├─nested
    │  ├─menu1
    │  │  │  index.vue
    │  │  │  
    │  │  ├─menu1-1
    │  │  │      index.vue
    │  │  │      
    │  │  ├─menu1-2
    │  │  │  │  index.vue
    │  │  │  │  
    │  │  │  ├─menu1-2-1
    │  │  │  │      index.vue
    │  │  │  │      
    │  │  │  └─menu1-2-2
    │  │  │          index.vue
    │  │  │          
    │  │  └─menu1-3
    │  │          index.vue
    │  │          
    │  └─menu2
    │          index.vue
    │          
    ├─redirect
    │      index.vue
    │      
    ├─system 
    │  ├─casbin
    │  │      index.vue
    │  │      
    │  ├─dept
    │  │      index.vue
    │  │      
    │  ├─menu
    │  │      addDialog.vue
    │  │      dict.js
    │  │      index.vue
    │  │      select-tree.vue
    │  │      
    │  ├─role
    │  │      addDialog.vue
    │  │      authDialog.vue
    │  │      index.vue
    │  │      
    │  └─user
    │          addDialog.vue
    │          assignRoleDialog.vue
    │          index.vue
    │          
    ├─table
    │      index.vue
    │      
    └─tree
            index.vue

```

##  示例效果

![image](https://github.com/ludan3134/iamge/blob/main/projectMockup08.png)

![image](https://github.com/ludan3134/iamge/blob/main/projectMockup09.png)

![image](https://github.com/ludan3134/iamge/blob/main/projectMockup06.png)

![image](https://github.com/ludan3134/iamge/blob/main/projectMockup07.png)

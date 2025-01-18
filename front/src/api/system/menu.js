import request from '@/utils/request'

// 查询所有菜单列表(包含按钮)
export function getAllMenuTreeList(params) {
  return request({
    url: '/menu/getMenuList',
    method: 'post',
    data:params
  })
}

// 新增、编辑
// 同级菜单名称不能相同
export function saveMenu(data) {
  return request({
    url: '/menu/saveMenu',
    method: 'post',
    data: data
  })
}

// 新增
export function addMenu(data) {
  return request({
    url: '/menu/addMenu',
    method: 'post',
    data: data
  })
}

// 删除
// 存在子菜单禁止删除
export function deleteMenu(data) {
  return request({
    url: 'menu/deleteMenu',
    method: 'post',
    data: data
  })
}

// 编辑
export function editMenu(data) {
  return request({
    url: 'menu/updateMenu',
    method: 'post',
    data: data
  })
}

// roleId
export function getMenuTreeListByRoleId(params) {
  return request({
    url: 'menu/getMenuByRoleId',
    method: 'post',
    data: params
  })
}

export function getUserMenu(token) {
  return request({
    url: '/menu/getMenu',
    method: 'get',
  })
}
import request from '@/utils/request'

// 查询列表
export function getRoleList(params) {
  return request({
    url: 'role/getRoleList',
    method: 'post',
    data: params,
  })
}

// 新增、编辑
// name或code任意一个都不能重复
export function saveRole(data) {
  return request({
    url: 'role/upsetRole',
    method: 'post',
    data: data
  })
}


export function deleteRole(data) {
  return request({
    url: 'role/deleteRole',
    method: 'post',
    data: data
  })
}

// 根据角色设置菜单权限
export function roleSetPermissions(data) {
  return request({
    url: 'menu/setRoleMenu',
    method: 'post',
    data: data
  })
}
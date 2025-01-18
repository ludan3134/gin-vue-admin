import request from '@/utils/request'

// 查询列表
export function getUserList(params) {
  return request({
    url: '/user/getUserList',
    method: 'post',
    data: params
  })
}

// 检查loginName重复
export function saveUser(data) {
  return request({
    url: '/user/UpsetUser',
    method: 'post',
    data: data
  })
}

export function getRoleListByUserId(data) {
  return request({
    url: 'user/getRolesByUser',
    method: 'post',
    data: data
  })
}

// 不能删除自己的账户
export function deleteUser(data) {
  return request({
    url: 'user/deleteUser',
    method: 'post',
    data: data
  })
}


// 不能重置自己的密码
export function resetPwd(data) {
  return request({
    url: 'user/resetPassword',
    method: 'post',
    data: data
  })
}


export function assignRole(data) {
  return request({
    url: 'user/assignRole',
    method: 'post',
    data: data
  })
}

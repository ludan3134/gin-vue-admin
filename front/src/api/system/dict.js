import request from '@/utils/request'


// type
export function getDictList(params) {
  return request({
    url: '/dept/getDeptList',
    method: 'post',
    data: params
  })
}
export function upsetDept(params) {
  return request({
    url: '/dept/upsetDept',
    method: 'post',
    data: params
  })
}
export function deleteDept(params) {
  return request({
    url: '/dept/deleteDept',
    method: 'post',
    data: params
  })
}
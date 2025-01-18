import request from '@/utils/request'

// 查询列表
export function getCabinList(params) {
  return request({
    url: '/cabin/getCabinList',
    method: 'post',
    data: params
  })
}
export function editCabin(params) {
  return request({
    url: '/cabin/upsetCabin',
    method: 'post',
    data: params
  })
}
export function deleteCabin(params) {
  return request({
    url: '/cabin/deleteCabin',
    method: 'post',
    data: params
  })
}

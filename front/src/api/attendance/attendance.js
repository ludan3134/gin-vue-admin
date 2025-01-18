import request from '@/utils/request'
import axios from 'axios'

export function importDevice(params) {
  return request({
    url: '/attendance/importExcel',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    data:params
  })
}
export function exportAttendanceSheets(params) {
  return request({
    url: '/attendance/exportAttendanceSheets',
    method: 'post',
    responseType: 'blob', // 一定要设置响应类型，否则不能正确处理响应的数据
    data:params
  })
}
export function getAttendanceList(params) {
  return request({
    url: '/attendance/getAttendanceList',
    method: 'post',
    data: params
  })
}
export function editAttendance(params) {
  return request({
    url: '/attendance/upsetAttendance',
    method: 'post',
    data: params
  })
}
export function deleteAttendance(params) {
  return request({
    url: '/attendance/deleteAttendance',
    method: 'post',
    data: params
  })
}
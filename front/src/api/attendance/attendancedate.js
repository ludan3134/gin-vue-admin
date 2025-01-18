import request from '@/utils/request'
import axios from 'axios'


export function getAttendanceDateList(params) {
  return request({
    url: '/attendance/getAttendanceDateList',
    method: 'post',
    data: params
  })
}
export function editAttendanceDate(params) {
  return request({
    url: '/attendance/upsetAttendanceDate',
    method: 'post',
    data: params
  })
}
export function deleteAttendanceDate(params) {
  return request({
    url: '/attendance/deleteAttendanceDate',
    method: 'post',
    data: params
  })
}
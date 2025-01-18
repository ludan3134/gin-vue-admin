import request from '@/utils/request'

export function login(data) {
  return request({
    url: '/base/login',
    method: 'post',
    data
  })
}

export function getInfo(token) {
  return request({
    url: '/base/getUserInfo',
    method: 'get',
  })
}

export function logout() {
  return request({
    url: '/base/logout',
    method: 'post'
  })
}

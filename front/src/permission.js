import router from './router'
import store from './store'
import { Message } from 'element-ui'
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
import { getToken } from '@/utils/auth' // get token from cookie
import getPageTitle from '@/utils/get-page-title'
import Vue from 'vue'
const { userMenuTreeListData } = require('../mock/system/menuList')
NProgress.configure({ showSpinner: false }) // NProgress Configuration
const whiteList = ['/login'] // no redirect whitelist

router.beforeEach(async(to, from, next) => {
  // start progress bar
  NProgress.start()

  // set page title
  document.title = getPageTitle(to.meta.title)
  
  // determine whether the user has logged in
  const hasToken = getToken()
  if (hasToken) {
    if (to.path === '/login') {
      // if is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done() // hack: https://github.com/PanJiaChen/vue-element-admin/pull/2939
    } else {
      // determine whether the user has obtained his permission roles through getInfo
      const hasRoles = store.getters.roles && store.getters.roles.length > 0
      console.log("hasRoles",hasRoles)
      if(hasRoles){
        next()
      }else{
        try {
          const { roles } = await store.dispatch('user/getInfo')
          var accessRoutes = []
          // commit('SET_ROLES', ['editor2'])
          // get user info
          // note: roles must be a object array! such as: ['admin'] or ,['developer','editor']
          const data = await store.dispatch('user/getUserMenus')
          // menus = userMenuTreeListData
          var asyncRoutes = await store.dispatch('permission/generateDynamicRoutes', data)
          asyncRoutes = asyncRoutes.concat([{ path: '*', redirect: '/404', hidden: true }])
          accessRoutes = asyncRoutes
          console.log("asyncRoutes",asyncRoutes)
          // generate accessible routes map based on roles
          // dynamically add accessible routes
          router.addRoutes(accessRoutes)

          // hack method to ensure that addRoutes is complete
          // set the replace: true, so the navigation will not leave a history record
          next({ ...to, replace: true })
        } catch (error) {
          // remove token and go to login page to re-login
          await store.dispatch('user/resetToken')
          Message.error(error || 'Has Error')
          next(`/login?redirect=${to.path}`)
          NProgress.done()
        }
      }
    
    }
  } else {
    /* has no token*/

    if (whiteList.indexOf(to.path) !== -1) {
      // in the free login whitelist, go directly
      next()
    } else {
      // other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach(() => {
  // finish progress bar
  NProgress.done()
})
Vue.directive('permission', {
  inserted: function(el, binding) {
    const action = binding.value.action
    const currentRight = router.currentRoute.meta.buttons
    if (currentRight) {
      if (currentRight.indexOf(action) === -1) {
        // no permission
        const type = binding.value.effect
        if (type === 'disabled') {
          el.disabled = true
          el.classList.add('is-disabled')
        } else {
          el.parentNode.removeChild(el)
        }
      }
    }
  }
})
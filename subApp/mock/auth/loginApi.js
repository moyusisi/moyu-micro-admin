// mock的接口返回数据
export default [
  // 登陆接口
  {
    url: '/api/auth/login',
    method: 'post',
    response: { "code": "00000", "message": "成功", "data": "b73f40c375a647b893782da06b4407de" }
  },
  // 退出接口
  {
    url: '/api/auth/logout',
    method: 'post',
    response: { "code": "00000", "message": "成功" }
  },
];
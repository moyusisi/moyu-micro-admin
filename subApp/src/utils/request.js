// 统一的请求发送
import axios from 'axios'
import { Modal, message } from 'ant-design-vue'
import settings from '@/config/settings'
import router from "@/router"
import { useRoute } from 'vue-router'

// 创建 axios 实例
const service = axios.create({
	// baseURL: '/api', // api base_url
	baseURL: settings.API_URL,
	timeout: 50000 // 请求超时时间
})

// HTTP request 拦截器
service.interceptors.request.use(
	(config) => {
		// header中携带token
		const token = localStorage.getItem("TOKEN");
		if (token) {
			config.headers.Authorization = settings.TOKEN_PREFIX + token;
		}
		// get请求携带时间戳
		if (config.method === 'get') {
			config.params = config.params || {}
			config.params._ = new Date().getTime()
		}
		console.log('请求URL:', config.url)
		return config
	},
	(error) => {
		return Promise.reject(error)
	}
)

// HTTP response 拦截器
service.interceptors.response.use(
	(response) => {
		// console.log(response)
		// 二进制数据则直接返回
		if (response.request.responseType === 'blob') {
			return response
		}
		// 响应数据为二进制流，直接返回
		if (response.data instanceof Blob || response.data instanceof ArrayBuffer) {
			return response;
		}

		// 返回的报文内容
		const res = response.data
		// 特殊错误码处理
		if (res.code === "A0230") {
			// message.error(res.message || "登陆已失效，请重新登陆")
			reLogin()
			return Promise.reject(res);
		}
		// 成功直接返回数据
		if (res.code === "00000") {
			return Promise.resolve(res)
		}

		console.log("系统响应错误:" + response.config.url)
		message.error(res.message || "系统响应错误")
		return Promise.reject(res)
	},
	(error) => {
		console.error('系统错误', error)
		message.error('网络请求失败，请检查网络设置')
		return Promise.reject(error.message);
	}
)

// 保持重新登录Modal的唯一性
const reLoginShow = ref(false)
const reLogin = () => {
	// 防止多个请求时重复弹框
	if (reLoginShow.value) {
		return
	}
	reLoginShow.value = true
	Modal.error({
		title: '提示：',
		okText: '重新登录',
		content: '未登录或登录已过期， 请重新登录',
		onOk: () => {
			const currentRoute = router.currentRoute.value
			console.log('reLogin...')
			localStorage.clear()
			// 跳转到登录页
			router.push(`/login?redirect=${currentRoute.fullPath}`).catch(err => {
				console.log(err)
			})
			reLoginShow.value = false
		}
	})
}

// 自定义的通用下载方法
service.download = function download(url, data, config) {
	return service({
		url: url,
		method: 'post',
		// data是json，params是查询参数
		data: data,
		// 在config中设置 responseType 是下载结果响应处理的关键
		responseType: 'blob',
		...config
	}).then((response) => {
		if (response.data.type === 'application/json') {
			const resText = response.data.text()
			const res = JSON.parse(resText)
			message.warn(res.message)
			return
		}
		const fileName = decodeURI(
			// attachment; filename="xxx.zip"
			response.headers["content-disposition"].split(";")[1].split("=")[1]
		);
		// 创建一个链接元素用于下载
		const url = window.URL.createObjectURL(new Blob([response.data]))
		const link = document.createElement('a')
		document.body.appendChild(link)
		link.href = url
		// 设置下载文件名
		link.download = fileName;
		// link.setAttribute('download', '123.zip')
		link.click()
		// 清理并移除链接元素
		document.body.removeChild(link)
		window.URL.revokeObjectURL(url)
	}).catch(err => {
		console.error(err)
		message.error('下载文件失败！')
	})
}

// 提交表单
service.postForm = function postForm(url, data, config) {
	// 删除所有的null属性和未定义属性
	const formData = new FormData()
	for (const key in data) {
		if (data[key] != null && typeof (data[key]) !== 'undefined') {
			formData.append(key, data[key])
		}
	}
	return service.post(url, formData, config)
}

// 提交Json
service.postJson = function postJson(url, data, config) {
	// 删除所有的null属性和未定义属性
	for (const key in data) {
		if (data[key] == null || typeof (data[key]) === 'undefined') {
			delete data[key]
		}
	}
	return service.post(url, data, config)
}

export default service

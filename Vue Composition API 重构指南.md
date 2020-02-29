# Vue Composition API 重构指南

> 现在是刚进入 3 月份了，估计 Vue3 也马上发布了，作为一个喜欢尝试新鲜事物的程序猿，第一时间就对自家的[项目](https://github.com/dream2023/vue-ele-form-generator)动手了，期间遇到过一些问题，这里就简单罗列一下

## vuex 无法使用了？！

具体参考另一篇 [Vue Composition API + Vuex 踩坑指南](https://github.com/dream2023/blog/blob/master/Vue%20Composition%20API%20%2BVuex%20%E9%87%8D%E6%9E%84%E8%B8%A9%E5%9D%91%E6%8C%87%E5%8D%97.md)

## `this` 无法使用了

在 `setup` 函数中，`this` 是指向 `undefined`

```js
setup() {
	this // undefined
	this.$message.success('新增成功') // 报错 /(ㄒoㄒ)/~~
}
```

遇到上面的情况，只能直接引入相应的文件即可解决

```js
import {Message} from 'element-ui'

setup() {
	Message.success('新增成功') // 可以 o(*￣▽￣*)ブ
}
```

## `props` 值无法监听变化

因为 `props` 返回值是 `reactive` 的值，如果单独监测或者处理一个 props 属性值，将不会检测到变化，必须通过 `toRefs` 函数将其转为 `ref`类型

```js
// 错误演示

{
	props: {
		width: Number | String
	},
	setup(props) {
		const { width } = props

		return {
			// 监测不到变化 /(ㄒoㄒ)/~~
			computedWidth: () => computed(() => typeof width === 'string' ? width : width + 'px')
		}
  	}
}
```

```js
// 正确演示
{
	props: {
		width: Number | String
	},
	setup(props) {
		const { width } = toRefs(props)

		watch(() => {
			// 整体使用，也是可以的 o(*￣▽￣*)ブ
			console.log(props.width)
		})

		return {
			// 可以检查到变化 o(*￣▽￣*)ブ
			computedWidth: () => computed(() => typeof width.value === 'string' ? width.value : width.value + 'px')
		}
  	}
}
```

## `$emit()`不见了

同第一个`this`指向问题，但是 vue 本身并没有提供类似`Vue.set`这样的 `Vue.emit` 方法，所以没得引入，但是`steup`第二个参数给带来了这个方法：

```js
steup (props, context) {
	watch(searchValue, (keyword) => {
		context.emit('change', keyword)
	})
}
```

## 完结寄语

在别人行动前行动，才能领先于人 ✿✿ ヽ(°▽°)ノ ✿

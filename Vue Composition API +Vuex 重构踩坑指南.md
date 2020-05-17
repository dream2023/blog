# Vue Composition API + Vuex 重构踩坑指南

> 最近我的[项目](https://github.com/dream2023/vue-ele-form-generator)刚用 `ts` + `Vue Composition Api` 完成重构， 期间遇到了一些小麻烦，其中之一就是 `vuex` 的使用方式的大变化，以下问题描述和解决方案的处理。

## 问题

**1、this.\$store 无法使用**

在 `stepup` 函数中，`this` 是指向 `undefined`

```js
setup() {
 this // undefined
}
```

所以，`this.$store.state.xxx` 是没有办法使用的

**2、`mapState` 和 `mapMutations` 等工具函数无法使用**

同样因为 `this` 的指向问题，mapState 等工具函数里面实际是使用了 `this`, 所以也无法使用

```js
// mapState 源码
export const mapState = normalizeNamespace((namespace, states) => {
  // ...
  const res = {};
  normalizeMap(states).forEach(({ key, val }) => {
    res[key] = function mappedState() {
      let state = this.$store.state;
      let getters = this.$store.getters;
      // ...
    };
  });
  return res;
});
```

## 解决方案

### 1.基于 Vue Composition API 设计的状态管理插件 [pinia](https://github.com/posva/pinia)

**优点：**

- 作者是 Vue Devtools 核心开发者，所以此插件对 Vue Devtools 友好
- 基于 Composition API 进行设计
- 与 vuex 类似的数据结构

**缺点：**

- 过于轻量，如果你是重构，使用了模块、vuex 插件等，重构较为麻烦
- 实验性，等 Vue3 正式出来，有可能有 vuex 的正式解决方案

具体使用可以参考 [官方仓库](https://github.com/posva/pinia)

### 2.直接引用 vuex 文件

```js
// 在需要使用的地方引入
import store from "../store/path";
```

**2.1 state 的获取**

因为 `state.store` 返回值是 `reactive` 的值，如果单独监测或者处理一个 state 属性值，将不会检测到变化，必须通过 `toRefs` 函数将其转为 `ref`类型

```js
// × 错误方式
const userId = state.state.userId;
watch(userId, () => {
  // 不能够检查到变化/(ㄒoㄒ)/~~
  console.log(userId);
});
```

```js
// √ 正确方式
const userId = toRefs(store.state);

watch(userId, () => {
  // 能够检查到变化(*^_^*)
  console.log(userId.value);
});
```

**2.2 mutation 等函数的调用**

依旧是采用最原始的方式，例如：

```js
setup() {
	return {
		updateIndex: (index) => store.commit('updateIndex', index)
	}
}
```

## 完结

在别人行动前行动，才能领先于人 ✿✿ ヽ(°▽°)ノ ✿

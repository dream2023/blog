function isObject(argument) {
  return argument && (typeof argument === 'function' || typeof argument === 'object')
}

function isFunction(argument) {
  return typeof argument === 'function'
}

class Promise {
  static PENDING = 'pending'
  static FULFILLED = 'fulfilled'
  static REJECTED = 'rejected'

  state = Promise.PENDING // 当前状态
  value // 终值
  reason // 拒因
  onFulfilledReactions = [] // 当 fulfilled 时的异步操作
  onRejectedReactions = [] // 当 rejected 时的异步操作

  constructor(executor) {
    // 参数校验，判断 executor 是否为函数
    if (!isFunction(executor)) {
      throw new TypeError(`Promise executor ${executor} is not a function`)
    }

    // 因为 executor 执行过程中有可能出错，所以需要 try/catch
    try {
      // 将 resolve 和 reject 注入
      executor(this.resolve, this.reject)
    } catch (e) {
      // 当发生错误时，调用 reject
      this.reject(e)
    }
  }

  // this 指向当前实例
  // value 为终值
  resolve = (value) => {
    // 状态一旦改变，再次调用也没用
    if (this.state === Promise.PENDING) {
      this.state = Promise.FULFILLED; // 改变状态
      this.value = value; // 赋终值
      this.onFulfilledReactions.forEach(fn => fn()); // 调用处理函数
    }
  }

  // this 指向当前实例
  // reason 为拒因
  reject = (reason) => {
    // 状态一旦改变，再次调用也没用
    if (this.state === Promise.PENDING) { // 等待状态才行
      this.state = Promise.REJECTED; // 改变状态
      this.reason = reason; // 赋值拒因
      this.onRejectedReactions.forEach(fn => fn()) // 执行操作
    }
  }

  // 用户传递的回调函数
  then(onFullfilled, onRejected) {
    // 为了透传，如果不是函数，则重新赋值为函数，也不抛错
    if (!isFunction(onFullfilled)) {
      onFullfilled = (value) => value;
    }

    if (!isFunction(onRejected)) {
      onRejected = (reason) => {
        throw reason;
      }
    }

    // 为了能链式调用，需要返回一个新的实例
    const promise2 = new Promise((resolve, reject) => {
      // fulfilled 时操作，为了访问 this.value，需要保持 this
      const onFulfilledReaction = () => {
        // 模拟异步
        setTimeout(() => {
          try {
            const x = onFullfilled(this.value) // 执行 onFullfilled
            Promise.resolvePromise(promise2, x, resolve, reject); // 继续处理返回值的情况
          } catch (e) {
            reject(e)
          }
        })
      }

      const onRejectedReaction = () => {
        setTimeout(() => {
          try {
            const x = onRejected(this.reason);
            Promise.resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        })
      }

      if (this.state === Promise.FULFILLED) {
        onFulfilledReaction()
      } else if (this.state === Promise.REJECTED) {
        onRejectedReaction()
      } else if (this.state === Promise.PENDING) {
        this.onFulfilledReactions.push(onFulfilledReaction);
        this.onRejectedReactions.push(onRejectedReaction)
      }
    })

    return promise2;
  }

  static resolvePromise(promise2, x, resolve, reject) {
    if (promise2 === x) { // 如果 x 和 promise2 相当，代表是有循环
      reject(new TypeError('Circling Chain detected in resolve promise'))
    } else if (!isObject(x)) { // 如果 x 不是一个对象，则直接返回
      resolve(x)
    } else if (x instanceof Promise) { // 如果 x 是一个 promise，需要等待 promise 结束
      x.then((value) => { // value 依然可能是例如 Promise 的类型，所以还需继续判断
        Promise.resolvePromise(promise2, value, resolve, reject)
      }, reject)
    } else {
      // thenable 形式
      let called = false; // 防止被调用多次
      try {
        const then = x.then;
        if (isFunction(then)) { // 如果 then 是一个函数，则符合 thenable
          then.call(x, (value) => { // 保持 x 的 this
            if (called) return;
            called = true;
            Promise.resolvePromise(promise2, value, resolve, reject)
          }, reason => {
            if (called) return;
            called = true;
            reject(reason)
          })
        } else {
          resolve(x); // 不是函数，则直接返回这个普通的对象
        }
      } catch (e) {
        if (called) return;
        called = true;
        reject(e)
      }
    }
  }
}

Promise.defer = Promise.deferred = function () {
  let dfd = {}
  dfd.promise = new Promise((resolve, reject) => {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
module.exports = Promise

# 20 分钟入门 deno

Deno 已经正式发布了 🎉！

不管外面是怎么吹，或者怎么贬，总之是骡子是马拉出来溜溜，了解后才有发言权，那我们就赶紧 20 分钟入门 deno 吧！

## 起步

### 安装

鉴于国内的网速原因，[@justjavac](https://github.com/denocn/deno_install/commits?author=justjavac) 大佬搞了国内的[镜像加速](https://github.com/denocn/deno_install)：

Mac/Linux

```bash
curl -fsSL https://x.deno.js.cn/install.sh | sh
```

Windows

```bash
iwr https://x.deno.js.cn/install.ps1 -useb -outf install.ps1; .\install.ps1
# iwr https://x.deno.js.cn/install.ps1 -useb | iex
```

### 设置环境变量

deno 没有 node 中的 node_modules 目录做为包存放的地方，但也需要一个地方存在安装的模块：

`DENO_DIR` 默认为 `$HOME/.deno`，就是 Deno 存放生成的代码和缓存的源码的路径。

```bash
# mac / linux
echo 'export DENO_DIR=$HOME/.deno' >> ~/.bash_profile
source ~/.bash_profile # 如果是 zsh 则：source ~/.zshrc
```

### 安装 VSCode 插件

由于 `import url` 的形式和 Deno 全局对象并未被 vscode 支持，所以需要借助插件 [Deno](https://marketplace.visualstudio.com/items?itemName=justjavac.vscode-deno) 进行支持：

> 注意：需要到 settings 中将 deno.enabled 设置为 true

安装前：
![YUbgts.png](https://s1.ax1x.com/2020/05/13/YUbgts.png)

安装后：

![YUbw1P.png](https://s1.ax1x.com/2020/05/13/YUbw1P.png)

### hello world

```bash
deno run https://deno.land/std/examples/welcome.ts
```

不出意外的话，你会看到：

```bash
Download https://deno.land/std/examples/welcome.ts
Compile https://deno.land/std/examples/welcome.ts
Welcome to Deno 🦕
```

如果重新执行一遍，你会看到 `Download` 和 `Compile` 过程没了，直接是结果：

```bash
Welcome to Deno 🦕
```

## 深入

### Deno 内置 API 使用

首先我们来看一下读取文件目录的例子：

```js
const dir = Deno.readDirSync(Deno.cwd());
for (const file of dir) {
  console.log(file);
}
```

这段代码的含义是：`Deno.cwd()` 表示当前目录，`Deno.readDirSync` 表示读取目录信息，并返回一个可迭代对象，我们使用 `for of` 进行输出。执行命令一下命令即可看到结果：

```bash
deno run --allow-read mod.ts
```

首先我们看到 deno 并未像 node 一样使用引入模块的方式，而是采用全局的 `Deno` 对象，我们输出即可看到全部内置 API：

```js
console.log(Deno);
```

我们使用 vscode 插件单击 Deno 对象即可跳转其 ts 定义：

![YUqtDU.gif](https://s1.ax1x.com/2020/05/13/YUqtDU.gif)

如果觉得是英文看不懂，则可以参考或替换[中文版](https://github.com/denodev/typedoc/blob/master/lib.deno.ns.d.ts)。

如果仍然觉得不够直观，可以参考 typedoc：[中文](https://deno.dev/typedoc/) 或 [英文](https://doc.deno.land/https/github.com/denoland/deno/releases/latest/download/lib.deno.d.ts)

### 支持 TS

在 Deno 中，TS 和 JS 都是一等公民，都可以完美支持。例如：

```js
// index.ts
let name: string = "ry";
name = 123;
```

```bash
> deno run index.ts
```

结果

```bash
Compile file:///Users/zhangchaojie/Desktop/demo/index.ts
error: TS2322 [ERROR]: Type '123' is not assignable to type 'string'.
name = 123;
~~~~
    at file:///Users/zhangchaojie/Desktop/demo/index.ts:2:1
```

### 权限

Deno 默认是没有 网络、文件读、文件写、环境变量读取等权限，需要显示的指明，例如：

```js
// index.js
// 获取数据
fetch("http://jsonplaceholder.typicode.com/posts/1")
  .then(res => res.json())
  .then(data => {
    console.log(data);
  });
```

```bash
deno run index.js
```

执行后，发现一串报错：

```bash
error: Uncaught PermissionDenied: network access to "http://jsonplaceholder.typicode.com/posts/1", run again with the --allow-net flag
```

我们加上权限试试：

```bash
deno run --allow-net index.js
{
 userId: 1,
 id: 1,
 title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
 body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas..."
}
```

如果觉得麻烦，可以使用 `-A` 参数允许全部权限。

### import URL

Deno 相对于 NodeJS 一大亮点是没有 `node_modules`，没有 `package.json`，通过 import URL 的形式进行第三方模块的引用：

```js
import { white, bgRed } from "https://deno.land/std/fmt/colors.ts";

console.log(bgRed(white("你好，世界")));
```

```bash
deno run --allow-net mod.ts
Compile file:///Users/zhangchaojie/Desktop/demo/mod.ts
Download https://deno.land/std/fmt/colors.ts
你好，世界 # 假装有颜色
```

虽然看似简单了，但也细心的你会发现很多问题：

1.有 `Compile` 和 `Download` 的过程，速度慢？

其实它只会在第一次执行的时候需要下载，然后会将其缓存起来，你重新执行，就会发现速度还是很快的：

```bash
deno run mod.ts
你好，世界 # 假装有颜色
```

2.没有网络怎么办？

上面说的，在第一次下载后，Deno 会将其缓存起来，具体缓存目录就是我们前面设置的环境变量 `$HOME/.deno`，我们可以使用 `tree` 命令看一下：

```bash
tree $HOME/.deno
/Users/zhangchaojie/.deno
├── deps
│   └── https
│       └── deno.land
│           ├── 3574883d8acbaf00e28990ec8e83d71084c4c668c1dc7794be25208c60cfc935
│           └── 3574883d8acbaf00e28990ec8e83d71084c4c668c1dc7794be25208c60cfc935.metadata.json
└── gen
    # ...

13 directories, 8 files
```

如果我们需要将代码部署到一个没有外网访问的环境，可以直接将此目录下的内容拷贝到相应的目录，并将环境变量指定到目录即可。

当然，如果是你在安装依赖第三方依赖，例如 `https://deno.land` 宕机了，那只能 GG，没得办法（PS：概率很小，就像 npmjs.com 宕机你也不能安装包一样）。

3.如何更新依赖？

如果依赖的文件更新了，我们可以通过 `--reload` 命令进行更新，还可以通过**白名单**的形式，只更新部分依赖：

```bash
deno run --reload=https://deno.land mod.ts
```

### 异步操作返回 Promise

Deno 中异步操作都是返回的 Promise 对象，并且支持 `top-level-await`，例如：

```js
const file = await Deno.create("./foo.txt");
console.log(file);
```

### 标准模块

Deno 为开发者提供了一个没有外部依赖的、实用的、高频的开发库，减轻我们开发的负担：

- [node](https://deno.land/std/node)：node API 兼容模块；
- [io](https://deno.land/std/io)：二进制读写操作；
- [http](https://deno.land/std/http)：网络和 web 服务相关；
- [path](https://deno.land/std/path)：文件路径相关；
- [colors](https://github.com/denoland/deno/blob/master/std/fmt/colors.ts)：输出有颜色的文字，类似 chalk 库；
- [printf](https://github.com/denoland/deno/blob/master/std/fmt/sprintf.ts)：格式化输出，类似 C 语言的 printf；
- [tar](https://github.com/denoland/deno/blob/master/std/archive/tar.ts)：解压与压缩；
- [async](https://deno.land/std/async)：生成异步函数的；
- [bytes](https://deno.land/std/bytes)：二进制比较和查找等；
- [datetime](https://deno.land/std/datetime)：日期相关；
- [encoding](https://deno.land/std/encoding)：文本的与二进制的转化、CSV 和对象转化、yarml 和对象转化等；
- [flags](https://deno.land/std/flags)：命令行参数解析；
- [hash](https://deno.land/std/hash)：字符转 sha1 和 sha256；
- [fs](https://deno.land/std/fs)：文件系统模块，类似 node 的 fs 模块；
- [log](https://deno.land/std/log)：日志管理；
- [permissions](https://deno.land/std/permissions)：权限相关；
- [testing](https://deno.land/std/testing)：测试和断言相关；
- [uuid](https://deno.land/std/uuid)：用于生成 UUID；
- [ws](https://deno.land/std/ws)：WebSocket 相关；

这个库会根据实际需要不断的完善和扩充，大家也可以贡献自己的一分力量。

### 内置工具

Deno 本着去开发依赖的思想，提供了一组实用的工具：

- deno bundle: 打包文件
- deno fmt: 格式化
- deno lint: 代码检查（还未实现）
- deno test: 测试

**deno bundle**：

你可以理解为 webpack 打包文件一样：

```js
// foo.js
const obj = { name: "foo" };
export default obj;
```

```bash
# 打包
deno bundle foo.js foo.bundle.js
```

```js
// index.js 引入打包后的文件
import foo from "./foo.bundle.js";
console.log(foo);
```

```bash
deno run index.js
{ name: "foo" }
```

**deno fmt**：

你可以理解为 Prettier 的功能：

```bash
# 创建一个文件
# 注意左侧有空格
echo "console.log( 'foo')" > index.js
```

```bash
# 格式化
deno fmt index.js
```

```bash
# 查看文件
cat index.js
console.log("foo"); # 左侧空格没了 😊
```

**deno test**：
你可以理解为 Jest 的功能：

```js
// 引入断言模块
import { assertEquals } from "https://deno.land/std/testing/asserts.ts";

Deno.test("hello test", () => {
  const x = "hello" + " test";
  assertEquals(x, "hello test");
});
```

## 学习和资料

- [官网](https://deno.land/): 权威一手信息；
- [入门文档](https://deno.land/manual)：从了解到入门；
- [标准模块](https://deno.land/std)：万物之源；
- [第三方模块](https://deno.land/x)：群英荟萃；
- [国内安装加速](https://github.com/denocn/deno_install)：告别安装慢；
- [中文手册](https://nugine.github.io/deno-manual-cn/)：英语犯困者的福音；
- [ts 定义中文](https://github.com/denodev/typedoc)：同上，中文解释的 ts 定义。

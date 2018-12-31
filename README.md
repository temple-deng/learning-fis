# FIS3

<!-- TOC -->

- [FIS3](#fis3)
  - [构建](#构建)
    - [domain-and-url](#domain-and-url)
  - [资源定位](#资源定位)
    - [在 html 中定位资源](#在-html-中定位资源)
    - [在 js 中定位资源](#在-js-中定位资源)
    - [在 css 中定位资源](#在-css-中定位资源)
  - [内容嵌入](#内容嵌入)
    - [在 html 中嵌入资源](#在-html-中嵌入资源)
    - [在 js 嵌入资源](#在-js-嵌入资源)
    - [在 css 中嵌入资源](#在-css-中嵌入资源)
  - [声明依赖](#声明依赖)
    - [在 html 中声明依赖](#在-html-中声明依赖)
    - [在 js 中声明依赖](#在-js-中声明依赖)
    - [在 css 中声明依赖](#在-css-中声明依赖)
  - [工作原理](#工作原理)
    - [单文件编译流程](#单文件编译流程)
  - [初级使用](#初级使用)
    - [loader](#loader)
  - [高级使用](#高级使用)
    - [模块化开发](#模块化开发)
  - [插件开发](#插件开发)
    - [编译阶段插件](#编译阶段插件)
    - [打包阶段插件](#打包阶段插件)
  - [资源打包](#资源打包)
    - [packTo](#packto)
    - [fis3-packager-map](#fis3-packager-map)
  - [fis3-smarty](#fis3-smarty)

<!-- /TOC -->

## 构建

根据情况来看，构建过程对资源 URI 进行了替换，替换成了绝对 URL。通俗点将就是相对路径替换
成了绝对路径。FIS 把这个叫做资源定位能力。即在构建后我们仍然能准确定位到引入资源的位置。
那也就是说 FIS 认为我们 `fis3 release -d <path>` 时的 `path` 看成了一个服务器提供
静态资源文件的目录。   

```
.
|--index.html
|--app.tpl
|--fis-conf.js
|--app.js
|--style.css
|--img
    |--list-1.png
    |--list-2.png
    |--logo.png
```   

fis-conf.js:   

```js
fis.match('*.{png,js,css}', {
  release: '/static/$0'
});
```   

然后 `fis3 release -d dist`   

最后 dist 的结构如下：   

```
-dist
  |--index.html
  |--app.tpl
  |--static
        |--app.js
        |--style.css
        |--img
            |--list-1.png
            |--list-2.png
            |--logo.png
```    

能看出来，如果在 match 中匹配的文件都会按照 `release` 属性指定的方式移动并更名，剩下那些除
fis-conf.js 之外的所有未命中的文件都会按照在原项目目录中的位置移动一下就好。    

而且需要注意的是 app.tpl 模板中引入的文件资源的定位也会被修改，那解析这样文件的能力是本身就提供的，
还是说重定位是按照正则替换修改的呢。    

随便建了个文本文件，里面写了 `./style.css`，结果在构建后并没有修正这个地址，看来可能是对 tpl
文件内置了处理。   

### domain-and-url

从这个例子能看出，如果没有 url 配置，那么最终资源的引入地址就是 domain + release 属性的值，
但是如果有了 url，那就用这个 url 替换掉了 release，而且这里好像有 bug，使用 domain + url
的模式，url 必须以 `/` 开头，不然就是两个字符串拼在一起了，但是 release 属性好像可以正确处理
release 地址开头是否带 `/` 的情况，而且使用 url `/static/$0` 这种形式 `static` 和资源
文件名之前是两个 `/`，必须写成 `/static$0` 才行。这里又和 release 不一样，感觉 url 存在
两个 bug。    

而且在 `release` 属性中，写成 `static$0` 或者 `static/$0` 都能正确处理。  

## 资源定位

### 在 html 中定位资源

FIS3 支持对 html 中的script、link、style、img、video、audio、embed等标签的src或href属性进行
分析，一旦这些标签的资源定位属性可以命中已存在文件，则把命中文件的url路径替换到属性中，同时可
保留原来url中的query查询信息。    

### 在 js 中定位资源

js语言中，可以使用编译函数 `__uri(path)` 来定位资源，fis分析js文件或 html中的script
标签内内容 时会替换该函数所指向文件的线上url路径。   

```js
var img = __uri('images/logo.gif');
```   

编译后：   

```js
var img = '/images/logo_74e5229.gif';
```    

### 在 css 中定位资源

fis编译工具会识别css文件或 html的style标签内容 中 `url(path)` 以及 `src=path` 字段，
并将其替换成对应资源的编译后url路径。话说都没见过 src=path 是干嘛的。   

## 内容嵌入

嵌入资源即内容嵌入，可以为工程师提供诸如图片base64嵌入到css、js里，前端模板编译到js文件中，
将js、css、html拆分成几个文件最后合并到一起的能力。   

### 在 html 中嵌入资源

在html中可以嵌入其他文件内容或者base64编码值，可以在资源定位的基础上，给资源加 ?__inline 
参数来标记资源嵌入需求。

```html
<img title="百度logo" src="images/logo.gif?__inline"/>
<link rel="stylesheet" type="text/css" href="demo.css?__inline">
<script type="text/javascript" src="demo.js?__inline"></script>
<link rel="import" href="demo.html?__inline">
```    

编译后：   

```html
<img title="百度logo" src="data:image/gif;base64,R0lGODlhDgGBALMAAGBn6eYxLvvy9PnKyfO...Jzna6853wjKc850nPeoYg" />
<style>img { border: 5px solid #ccc; }</style>
<script type="text/javascript">console.log('inline file');</script>
<!-- this is the content of demo.html -->
<h1>demo.html content</h1>
```   

### 在 js 嵌入资源

在js中，使用编译函数 __inline() 来提供内容嵌入能力。可以利用这个函数嵌入图片的base64编码、
嵌入其他js或者前端模板文件的编译内容， 这些处理对html中script标签里的内容同样有效。    

```js
__inline('demo.js');
var img = __inline('images/logo.gif');
var css = __inline('a.css');
```    

编译后：   

```js
console.log('demo.js content');
var img = 'data:image/gif;base64,R0lGODlhDgGBALMAAGBn6eYxLvvy9PnKyfO...Jzna6853wjKc850nPeoYgAgA7';
var css = "body \n{    color: red;\n}";
```    

### 在 css 中嵌入资源

与html类似，凡是命中了资源定位能力的编译标记， 除了src="xxx"之外，都可以通过添加 ?__inline
编译标记都可以把文件内容嵌入进来。src="xxx"被用在ie浏览器支持的filter内，该属性不支持base64
字符串，因此未做处理。    

```css
@import url('demo.css?__inline');
.style {
    background: url(images/logo.gif?__inline);
}
```    

编译后：    

```css
img { border: 5px solid #ccc; };
.style {
    background: url(data:image/gif;base64,R0lGODlhDgGBALMAAGBn6eYxLvvy9PnKyfO...Jzna6853wjKc850nPeoYgAgA7);
}
```    

## 声明依赖

声明依赖能力为工程师提供了声明依赖关系的编译接口。   

FIS3 在执行编译的过程中，会扫描这些编译标记，从而建立一张 静态资源关系表，资源关系表详细记录了
项目内的静态资源id、发布后的线上路径、资源类型以及 依赖关系 和 资源打包 等信息。   

### 在 html 中声明依赖

用户可以在html的注释中声明依赖关系：   

```html
<!--
    @require demo.js
    @require "demo.css"
-->
```   

话说给 html 声明依赖有什么意义呢，仅仅在 manifest.json 中添加了记录，然后后端会用这个记录
做些什么事情呢。   

### 在 js 中声明依赖

fis支持识别js文件中的注释中的@require字段标记的依赖关系，这些分析处理对 html的script标签内容
同样有效。    

```js
//demo.js
/**
 * @require demo.css
 * @require list.js
 */
```   

经过编译之后，查看产出的 manifest.json 文件，可以看到：   

```json
{
    "res" : {
        ...
        "demo.js" : {
            "uri" : "/static/js/demo_33c5143.js",
            "type" : "js",
            "deps" : [ "demo.css", "list.js", "jquery" ]
        },
        ...
    },
    "pkg" : {}
}
```    

### 在 css 中声明依赖

fis支持识别css文件注释中的@require字段标记的依赖关系，这些分析处理对 html的style标签内容
同样有效。    

```css
/**
 * demo.css
 * @require reset.css
 */
```   

所以 FIS 提供的声明依赖能力，就真是仅仅是声明而已吧，都是通过注释的方式，然后将依赖添加到
manifest.json 中。    

## 工作原理

FIS3 是基于文件对象进行构建的，每个进入 FIS3 的文件都会实例化成一个 File 对象，整个构建过程
都对这个对象进行操作完成构建任务。以下通过伪码来阐述 FIS3 的构建流程。   

```js
fis.release = function (opt) {
  // 这里 src 是 root 目录下的所有 include 的文件路径数组
  var src = fis.util.find(fis.project.root);
  var files = {};
  src.forEach(function (f) {
    // 构造文件对象
    var file = new File(f);
    // subpath 是文件基于项目 root 的绝对路径
    // compile 是编译入口，输入为文件对象，没有输出，直接修改文件对象内容
    files[file.subpath] = fis.compile(file);
  });

  // 没在 API 文档中找到 matchRules()....
  // 看这个意思是找到 ::package 选择器的 props，即打包的属性
  var packager = fis.matchRules('::package');
  var keys = Object.keys(packager);
  var ret = {
    files: files,
    map: {}
  };
  // 有前置打包器，就交由它先处理
  if (keys.indexOf('prepackager') > -1) {
    pipe('prepackager', ret);
  }

  if (keys.indexOf('packager') > -1) {
    pipe('packager', ret);
  }

  // 话说这里 files 直接调用 forEach 方法不对吧
  // files 应该是普通对象
  files.forEach(function (f) {
    // 打包阶段产出的 map 表替换到文件
    if (f._isResourceMap) {
      f._content = f._content.replace(/\b__RESOURCE_MAP__\b/g, JSON.stringify(ret.map));
    }
  });

  if (keys.indexOf('spriter') > -1) {
    pipe('spriter', ret);
  }
  if (keys.indexOf('postpackager') > -1) {
    pipe('postpackager', ret);
  }
  // 话说 ret 不会返回嘛
}
```     

### 单文件编译流程

```js
fis.compile = function (file) {
  if (file.isFile()) {
    if (exports.useLint && file.lint) {
      pipe('lint', file);
    }
    if (!file.hasCache) {
      process(file);
    } else {
      file.revertCache();
    }
  } else {
    process(file);
  }
};

function process(file) {
  if (file.parser) {
    pipe('parser', file);
  }
  if (file.preprocessor) {
    pipe('preprocessor', file);
  }
  if (file.standard) {
    standard(file); // 标准化处理
  }
  if (file.postprocessor) {
    pipe('postprocessor', file);
  }
  if (file.optimizer) {
    pipe('optimizer', file);
  }
}
```

## 初级使用

```js
fis.match('*.less', {
  parser: fis.plugin('less'),
  rExt: '.css'
});

fis.match('::packager', {
  postpackager: fis.plugin('loader')
})

fis.match('*.{less,css}', {
  packTo: '/static/aio.css'
});

fis.match('*.js', {
  packTo: '/static/aio.js'
});
```   

这里注释的几点，首先 less 文件会在 -d 指定的目录中出现，会生成一个 css 文件，但是在 css 文件
打包时，可以看到打包使用的匹配路径还是原 less 后缀。    

而且需要注意的是，文件的打包好像是 fis 自带的功能，而那个 fis3-postpackager-loader 好像是
用来对资源定位修正的，如果没有这个插件的话，比如说在 html 文件中，还是对原先多个文件的引入，
而不是对一个单一打包文件的引入，使用了这个插件后，就会修改引用，从而只引入一个打包文件。   

### loader

下面是作者说的 fis3-postpackager-loader 的处理流程：   

1. 遍历所有的 html 文件，每个文件单独走以下流程
2. 分析 html 内容，插入注释块 `<!--SCRIPT_PLACEHOLDER-->` 到 `</body>` 前面，如果页面
没有这个注释块的话
3. 分析 html 内容，插入注释快 `<!--STYLE_PLACEHOLADER-->` 到 `</head>` 前面，如果页面
没有这个注释的话。
4. 分析源码中 `<script>` 带有 data-loader 属性的或者资源名为 `[mod.js, require.js, sea.js, system.js]`
的资源。把找到的 js 加入队列，并且在该 `<script>` 后面加入 `<!--RESOURCEMAP_PLACEHOLADER-->`
注释，如果页面没有这个注释的话
5. 分析源码中 `<script>` 带有 data-framework 属性的资源找出来，把找到的 js 加入队列。
6. 如果不存在 `<!--DEPENDENCIES_INJECT_PLACEHOLADER-->` 注释，则开始分析此 html 文件
的依赖，以及递归进去查找依赖中的依赖。把分析到的 js 加入到队列，css 加入到队列。如果存在，
则在步骤 7 中处理，遇到注释开始加入依赖。（话说这里的依赖是指引入资源，还是说fis 提到的用注释
引入的依赖）
7. 分析此 html 中 `<script>`, `<link>` 和 `<style>` 把搜集到的资源加入队列
8. 启用 allinone 打包，把队列中，挨一起的资源合并。如果是内联内容，直接合并即可，如果是外链
文件，则合并文件内容，生成新内容。
9. 把优化后的结果，即队列中资源，插入到 `<!--SCRIPT_PLACEHOLADER-->`, `<!--STYLE_PLACEHOLADER-->`
和 `<!--RESOURCEMAP_PLACEHOLADER-->` 注释块。    

那这里就很奇怪的了，测试的时候，打包这一行为显然是在没有这个插件的时候也能正常工作的，只不过可能
对资源的引入方式不对，但这里插件的意思是它来进行打包，这就有点诡异了。   


## 高级使用

map.json 的大致结构。  

```json
{
    "res": {
        "static/about.css": {
            "uri": "/static/about.css",
            "type": "css",
            "pkg": "p0"
        },
        "static/about.js": {
            "uri": "/static/about.js",
            "type": "js",
            "pkg": "p1"
        },
        "static/common.css": {
            "uri": "/static/common.css",
            "type": "css",
            "pkg": "p0"
        },
        "static/index.css": {
            "uri": "/static/index.css",
            "type": "css",
            "pkg": "p0"
        },
        "static/index.js": {
            "uri": "/static/index.js",
            "type": "js",
            "pkg": "p1"
        },
        "static/test.less": {
            "uri": "/static/test.css",
            "type": "css"
        },
        "static/lib/module-a.js": {
            "uri": "/static/lib/module-a.js",
            "type": "js",
            "extras": {
                "moduleId": "static/lib/module-a"
            }
        },
        "static/lib/module-b.js": {
            "uri": "/static/lib/module-b.js",
            "type": "js",
            "extras": {
                "moduleId": "static/lib/module-b"
            },
            "deps": [
                "static/lib/module-a.js"
            ]
        },
    },
    "pkg": {
        "p0": {
            "uri": "/static/aio.css",
            "type": "css",
            "has": [
                "static/about.css",
                "static/common.css",
                "static/index.css"
            ]
        },
        "p1": {
            "uri": "/static/aio.js",
            "type": "js",
            "has": [
                "static/about.js",
                "static/index.js"
            ]
        }
    }
}
```   

### 模块化开发

在 FIS 中，依赖本身在构建过程中就已经分析完成，并记录在静态资源映射表中，那么对于线上运行时，
模块化框架就可以省掉依赖分析这个步骤了。    

在声明依赖内置语法中提到了几种资源之间标记依赖的语法，这样模板可以依赖 js、css，js 可以依赖某些
css，或者某个类型的组件可以互相依赖。   

另外，考虑到 js 还需要有运行时支持，所以对于不同前端模板化框架，在 js 代码中 FIS 编译分析依赖
增加了几种依赖函数的解析。    

考虑到不可能同时运用多个模块化框架（因为全都占用同样的全局函数，互斥），所以编译支持这块分成三个
插件进行支持。   

- fis3-hook-commonjs
- fis3-hook-amd
- fis3-hook-cmd

如上面说到的，这个编译插件只是对编译工具做一下扩展，支持前端模块化框架中的组件与组件之间依赖的
函数，以及入口函数来标记生成到静态资源映射表中；另外一个功能是针对某些前端模块化框架的特性自动
添加 define。   

其实应该是两个功能，一个是提供对 require 等加载模块语句的解析，能够让我们通过加载语句引入模块，
并将其声明成依赖，添加到 map.json 中，这里的依赖和前面提到的通过注释语法的依赖是相同的，另一
方面应该是将一些声明了 isMod 的模块使用 `define` 函数保证吧。   

有了依赖表，但如何把资源加载到页面上，需要额外的FIS 构建插件或者方案支持。这里的构建插件就可以
使用上面说的那个 fis3-postpackager-loader

## 插件开发

FIS3 是以 File 对象为中心构建编译的，每一个 File 都要经历编译、打包、发布三个阶段。   

### 编译阶段插件

在编译阶段，文件是单文件进行编译的，这个阶段主要是对文件内容的编译分析；这个阶段分为 lint、
parser、preprocessor、postprocessor、optimizer 等插件扩展点。    

```js
/**
 * Compile 阶段插件接口
 * @param  {string} content     文件内容
 * @param  {File}   file        fis 的 File 对象 [fis3/lib/file.js]
 * @param  {object} settings    插件配置属性
 * @return {string}             处理后的文件内容
 */
module.exports = function (content, file, settings) {
    return content;
};
```    

### 打包阶段插件

到打包阶段，所有的文件都经过了单文件处理，该压缩的已经被压缩，该预编译的也进行了预编译。这个阶段
主要实现一些共性的功能，比如打包合并。所以插件接口也不太一样了。   

```js
/**
 * 打包阶段插件接口
 * @param  {Object} ret      一个包含处理后源码的结构
 * @param  {Object} conf     一般不需要关心，自动打包配置文件
 * @param  {Object} settings 插件配置属性
 * @param  {Object} opt      命令行参数
 * @return {undefined}
 */
module.exports = function (ret, conf, settings, opt) {
    // ret.src 所有的源码，结构是 {'<subpath>': <File 对象>}
    // ret.ids 所有源码列表，结构是 {'<id>': <File 对象>}
    // ret.map 如果是 spriter、postpackager 这时候已经能得到打包结果了，
    //         可以修改静态资源列表或者其他
}
```   

## 资源打包

### packTo

命中目标文件，设置 packTo 即能完成简单的合并操作。   

### fis3-packager-map

packTo 其实用的就是这个插件，fis3 内部其实就是把 packTo 转成了这个插件的配置。   

## fis3-smarty

Smarty 解决方案目录规范指定 widget 目录下的都是组件。为了表述更清晰一些，我们把组件分为 UI
组件 和 模板组件。   

- UI 组件，不包含后端模板的组件
- 模板组件，包含后端模板的组件    

对于模板组件，页面调用使用后端框架提供的 widget 模板接口。   

```
{%widget name="common:widget/header/header.tpl"%}
```   

当模板解析时会解析对应的组件模板，并且把模板依赖的静态资源收集并插入页面，保证组件能正常工作。   

对于 UI组件，包含 js 的组件，通过前端模版化框架提供的接口进行调用。    

```js
require('./a.js'); // 相对路径
require('/widget/ui/a.js'); // 相对于模板根目录的绝对路径。
require('common:widget/ui/a.js'); // 使用 ID 进行调用，跨模块调用时必须用 ID 调用
```    

如果 UI 组件只包含 css 那么通过 FIS 提供的声明依赖内置语法进行使用。    

在 js 中：   

```js
// @require ./a.css
```   

在 Smarty 中:   

```html
<!-- @require ./a.css -->
```  

或者由后端框架提供的 require 模板接口调用:   

```
{%require name="common:widget/a.css"%}
```   

mod.js 不负责加载同步使用的组件，由用户或者后端程序负责给页面添加 `<script src="..."><script>`
进行加载。    

异步加载的组件，由 mod.js 负责加载，但具体组件的 url 由用户或者后端程序设置 `require.resourceMap`
确定。    

依赖已经由构建工具生成，剩下就是解析依赖给页面添加资源，Smarty 解决方案通过后端程序解析
map.json 来拿到执行页面所有依赖的资源，并在页面返回给浏览器时替换到页面对应位置。我们把这套
程序叫后端模块化框架。主要功能：    

- 分析组件依赖，保持组件依赖顺序
- 同步使用组件在页面生成 script、link 让浏览器加载组件资源
- 异步组件生成 require.resourceMap
- 提供 widget 接口，可以加载整个模板组件

**script**    

如果内嵌资源中引用了（`require`）某个组件化 js ，就必须放到此标签内；此标签内的 js 最后会
收集起来统一放置到 `</body>` 后。    

```js
{%script%}
var c = require('/widget/ui/a/a.js');
{%/script%}
```   

style 同上。    

**require**    

模板层面的资源加载接口，如果使用原生 link 或者 script 引用资源不会被收集起来放到 
`</body>` 标签后面，所以就有了这个接口。    


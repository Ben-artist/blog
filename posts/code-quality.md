---
title: 聊聊代码质量：从实际经验出发
date: 2025-03-03
---

作为开发者，我们经常会遇到需要维护他人代码的情况。每当这时，代码质量的重要性就会变得异常明显。本文将从实际工作经验出发，分享一些提高代码质量的实用建议。

---

## 为什么代码质量很重要？

接手别人的项目时，我经常遇到这些问题：

- 代码结构混乱，修改一处可能引发连锁反应
- 性能低下，运行缓慢
- 可读性差，理解代码逻辑需要花费大量时间

这些问题不仅影响工作效率，还会增加项目维护成本。下面我们就来聊聊如何避免这些问题。

## 提高代码可读性

### 1. 注释的艺术

**好的代码是自解释的，坏的注释比没有注释更糟糕。**

::: tip 注释建议
- **少而精的注释**：如果代码足够清晰，就不需要过多注释。过多的注释反而会分散注意力。
- **删除注释掉的代码**：不要保留那些被注释掉的代码块，它们只会让文件变得臃肿。如果需要，可以通过版本控制系统找回。
- **避免无意义的标记注释**：不要使用大块分隔符作为注释，它们通常没有提供任何有价值的信息。
:::

❌ 不好的例子：
```js
// 这个函数用来处理数据
function processData(data) {
  // 遍历数据
  for (let i = 0; i < data.length; i++) {
    // 处理每一项
    doSomething(data[i]);
  }
  // 返回处理后的数据
  return data;
}
```

✅ 更好的例子：
```js
/**
 * 对原始数据应用业务规则并返回处理结果
 * @param {Array} data - 需要处理的原始数据
 * @returns {Array} - 处理后的数据
 */
function processData(data) {
  for (let i = 0; i < data.length; i++) {
    doSomething(data[i]);
  }
  return data;
}
```

### 2. 命名的智慧

**好的命名就像讲故事，让代码自己解释自己在做什么。**

::: tip 命名建议
- **有意义且可读**：避免使用 `a`、`b`、`c` 或过于通用的 `item`、`data`、`list` 等命名
- **使用解释性变量**：将复杂表达式赋值给有描述性名称的变量
- **保持一致性**：同一概念使用相同的命名方式
:::

❌ 难以理解的代码：
```js
const address = 'One Infinite Loop, Cupertino 95014';
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
saveCityZipCode(address.match(cityZipCodeRegex)[1], address.match(cityZipCodeRegex)[2]);
```

✅ 更易理解的代码：
```js
const address = 'One Infinite Loop, Cupertino 95014';
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
const [, city, zipCode] = address.match(cityZipCodeRegex);
saveCityZipCode(city, zipCode);
```

## 函数设计

函数是代码的基本构建块，设计良好的函数能大幅提升代码质量。

### 1. 函数命名与功能

**函数名应该清晰表达其功能，就像一个小小的文档。**

❌ 不好的例子：
```js
function getData(data) {
  let arr = [];
  for (let i = 0; i < data.length; i++) {
    arr.push(data[i]);
  }
  return arr;
}
```

✅ 更好的例子：
```js
function copyArray(sourceArray) {
  return [...sourceArray];
}
```

### 2. 函数参数

**参数越少，函数越容易理解和测试。**

::: tip 参数建议
- 尽量控制在3个以内
- 当参数较多时，使用对象参数
:::

❌ 参数过多：
```js
function createMenu(title, body, buttonText, cancellable, fontSize) {
  // ...
}
```

✅ 使用对象参数：
```js
function createMenu({ title, body, buttonText, cancellable, fontSize }) {
  // ...
}

// 调用时更清晰
createMenu({
  title: '设置',
  body: '您确定要保存这些设置吗？',
  buttonText: '保存',
  cancellable: true
});
```

### 3. 保持函数简短

**一个函数应该只做一件事，并且做好。**

::: tip 函数长度建议
- 函数应该短小精悍
- 长函数应该拆分为多个小函数
- 每个函数应该只有一个责任
:::

## 代码结构与组织

### 关注点分离

将不同功能的代码分开，每个部分只关注自己的职责。

❌ 混合关注点：
```html
<div>
    <!-- 这里是页面头部 -->
    <header>
        <h1>网站标题</h1>
        <script>
            // 处理头部逻辑
            document.addEventListener('DOMContentLoaded', function() {
                // 各种头部相关的JavaScript代码
            });
        </script>
        <style>
            /* 头部样式 */
            header { background-color: blue; }
        </style>
    </header>

    <!-- 这里是主要内容 -->
    <main>
        <!-- 更多混合了HTML、CSS和JavaScript的代码 -->
    </main>
</div>
```

✅ 分离关注点：
```html
<!-- HTML文件：只包含结构 -->
<div>
    <header>
        <h1>网站标题</h1>
    </header>
    <main>
        <!-- 内容结构 -->
    </main>
</div>
```

```css
/* CSS文件：只包含样式 */
header {
    background-color: blue;
}
```

```js
// JavaScript文件：只包含行为
document.addEventListener('DOMContentLoaded', function() {
    // 初始化逻辑
});
```

## 代码长度

一个文件的长度，最好不要超过500行。如果超过500行，建议拆分。
看了一个将近 2000 行的代码，简直要崩溃了。。。

## 造轮子

你可以造轮子，但是要考虑清楚，这个轮子是否真的需要。  
而且你写的真的比别人好？我看的很多工具函数，在初始的时候可以用，但是随着业务的发展，可能就变得不适用了。改起来又特别费劲  
不如直接使用别人的轮子。特别是一些经得起时间考验的轮子，把时间放在业务上


## 总结

编写高质量代码不仅是一种技术能力，更是一种责任和态度。通过提高代码可读性、设计良好的函数和合理组织代码结构，我们可以创建出更易于维护、扩展和理解的代码库。

记住：今天写的代码，很可能是明天需要维护的技术债。为未来的自己和团队成员留下清晰、高质量的代码，是每个开发者应尽的职责。


后续会不断增加。。。


---
title: Vue3系列 - 虚拟DOM到真实DOM
date: 2025-03-01
tags: ['JavaScript', '虚拟DOM', 'DOM']
---

通过本文，你将深入了解虚拟DOM到真实DOM的转换过程，以及Vue3中的实现原理。本文将循序渐进地介绍相关概念和实现细节，帮助你全面理解这一核心技术。

---

## 虚拟DOM的概念与价值

### 什么是虚拟DOM

虚拟DOM(Virtual DOM，简称VDOM)是一种编程概念，它通过JavaScript对象来表示UI结构，这些对象保存在内存中，然后与真实DOM保持同步。

虚拟DOM本质上是一种设计模式，而非特定的技术实现。它的核心思想是在JavaScript和DOM之间建立一个抽象层，使开发者能够以声明式的方式描述UI，而无需直接操作DOM。

### 一个简单的虚拟DOM示例

```js
const vnode = {
  type: 'div',
  props: {
    id: 'container',
    class: 'wrapper'
  },
  children: [
    {
      type: 'span',
      children: '这是一段文本'
    }
  ]
}
```


上面的对象描述了一个简单的DOM结构：一个带有id和class的div元素，其中包含一个span元素，span中有一段文本。

### 虚拟DOM的价值

1. **性能优化**：通过批量更新和最小化DOM操作，减少浏览器重排重绘
2. **跨平台能力**：同一套虚拟DOM可以渲染到不同平台（Web、Native、Canvas等）
3. **编程体验**：提供声明式的API，使UI构建更直观、更易维护
4. **组件化支持**：为组件系统提供基础，使组件能够独立开发和复用

## 虚拟DOM的基础实现

让我们从零开始，逐步构建一个简单的虚拟DOM渲染器，以理解其工作原理。

### 第一步：创建虚拟节点

首先，我们需要定义虚拟节点的结构：

```js
// 创建虚拟节点
const vnode = {
  type: 'div',
  children: [
    {
      type: 'span',
      children: 'hello'
    }
  ]
}
```


这个虚拟节点描述了以下HTML结构：

```html
<div>
  <span>hello</span>
</div>
```


### 第二步：实现基础渲染函数

接下来，我们实现一个`render`函数，将虚拟节点转换为真实DOM节点：

```js
function render(vnode, container) {
  // 创建元素
  const el = document.createElement(vnode.type)
  
  // 处理子节点
  if (Array.isArray(vnode.children)) {
    // 如果子节点是数组，递归处理每个子节点
    vnode.children.forEach(child => render(child, el))
  } else {
    // 如果子节点是文本，创建文本节点
    el.appendChild(document.createTextNode(vnode.children))
  }
  
  // 将元素添加到容器中
  container.appendChild(el)
}

// 使用方式
render(vnode, document.getElementById('app'))
```


这个简单的渲染函数通过递归方式，将整个虚拟DOM树转换为真实DOM树。

## 增强虚拟DOM：处理属性和事件

实际应用中，DOM元素通常包含各种属性和事件监听器。我们需要扩展渲染器以支持这些特性。

### 处理元素属性

首先，扩展虚拟节点结构，添加`props`属性：

```js
const vnode = {
  type: 'div',
  props: {
    id: 'container',
    class: 'wrapper',
    onClick: () => alert('clicked')
  },
  children: [
    { 
      type: 'span',
      children: 'hello'
    }
  ]
}
```


然后，修改渲染函数以处理这些属性：

```js
function render(vnode, container) {
  const el = document.createElement(vnode.type)
  
  // 处理属性
  if (vnode.props) {
    Object.entries(vnode.props).forEach(([key, value]) => {
      // 处理事件
      if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase()
        el.addEventListener(eventName, value)
      } 
      // 处理class属性
      else if (key === 'class') {
        el.className = value
      } 
      // 处理其他属性
      else {
        el[key] = value
      }
    })
  }
  
  // 处理子节点（与之前相同）
  if (Array.isArray(vnode.children)) {
    vnode.children.forEach(child => render(child, el))
  } else {
    el.appendChild(document.createTextNode(vnode.children))
  }
  
  container.appendChild(el)
}
```


这样，我们的渲染器就能够处理元素属性和事件监听器了。

## 实现DOM更新：Patch算法

在实际应用中，UI会随着状态变化而更新。我们需要一种机制来高效地更新DOM，而不是每次都重新创建所有元素。

### Patch函数的基本结构

```js
function patch(n1, n2, container) {
  // 如果节点类型不同，直接替换
  if (n1.type !== n2.type) {
    processReplace(n1, n2, container)
    return
  }
  
  // 节点类型相同，更新属性和子节点
  processSameNode(n1, n2)
}
```


这个函数接收旧虚拟节点`n1`、新虚拟节点`n2`和容器元素，根据节点类型是否相同采取不同的更新策略。

### 处理节点替换

当新旧节点类型不同时，需要完全替换节点：

```js
function processReplace(n1, n2, container) {
  // 获取父节点和下一个兄弟节点（作为插入参考点）
  const parent = n1.el.parentNode
  const anchor = n1.el.nextSibling
  
  // 移除旧节点
  parent.removeChild(n1.el)
  
  // 创建新节点
  const newEl = document.createElement(n2.type)
  n2.el = newEl  // 保存DOM引用，便于后续更新
  
  // 插入到原位置
  parent.insertBefore(newEl, anchor)
  
  // 处理新节点的属性
  if (n2.props) {
    patchProps(newEl, {}, n2.props)
  }
  
  // 处理新节点的子节点
  processChildren(newEl, null, n2.children)
}
```


### 更新节点属性

当节点类型相同时，需要更新属性：

```js
function patchProps(el, oldProps, newProps) {
  // 设置新属性或更新已有属性
  for (const key in newProps) {
    const oldValue = oldProps?.[key]
    const newValue = newProps[key]
    
    if (newValue !== oldValue) {
      if (key === 'class') {
        el.className = newValue
      } else if (key.startsWith('on')) {
        // 移除旧事件监听器
        if (oldValue) {
          el.removeEventListener(key.slice(2).toLowerCase(), oldValue)
        }
        // 添加新事件监听器
        el.addEventListener(key.slice(2).toLowerCase(), newValue)
      } else {
        el[key] = newValue
      }
    }
  }
  
  // 删除不再存在的属性
  for (const key in oldProps) {
    if (!(key in newProps)) {
      if (key === 'class') {
        el.className = ''
      } else if (key.startsWith('on')) {
        el.removeEventListener(key.slice(2).toLowerCase(), oldProps[key])
      } else {
        el[key] = ''
      }
    }
  }
}
```


这个函数不仅处理属性的添加和更新，还处理属性的删除，确保DOM元素的状态与虚拟DOM完全同步。删除不再存在的属性尤为重要，特别是事件监听器，如果不移除可能导致内存泄漏。

### 更新子节点

子节点的更新是最复杂的部分，需要处理多种情况：

```js
function processChildren(el, oldChildren, newChildren) {
  // 处理文本子节点
  if (typeof newChildren === 'string') {
    if (typeof oldChildren === 'string') {
      // 文本内容变化时更新
      if (newChildren !== oldChildren) {
        el.textContent = newChildren
      }
    } else {
      // 旧子节点不是文本，直接替换
      el.textContent = newChildren
    }
  } 
  // 处理数组子节点
  else if (Array.isArray(newChildren)) {
    if (Array.isArray(oldChildren)) {
      // 新旧子节点都是数组，需要进行子节点的diff
      const commonLength = Math.min(oldChildren.length, newChildren.length)
      
      // 更新公共部分
      for (let i = 0; i < commonLength; i++) {
        patch(oldChildren[i], newChildren[i], el)
      }
      
      // 如果新子节点更多，添加多余的
      if (newChildren.length > oldChildren.length) {
        newChildren.slice(oldChildren.length).forEach(child => {
          render(child, el)
        })
      }
      
      // 如果旧子节点更多，删除多余的
      if (oldChildren.length > newChildren.length) {
        oldChildren.slice(newChildren.length).forEach(child => {
          el.removeChild(child.el)
        })
      }
    } else {
      // 旧子节点不是数组，清空后添加新子节点
      el.textContent = ''
      newChildren.forEach(child => render(child, el))
    }
  } 
  // 新子节点为空，清空内容
  else if (newChildren == null) {
    el.textContent = ''
  }
}
```


这个函数处理了多种子节点更新场景，包括文本到文本、数组到数组、文本到数组等转换情况。

## Vue3虚拟DOM的高级特性

Vue3在基础虚拟DOM实现之上，引入了多项优化和高级特性，显著提升了性能和开发体验。

### 静态提升

Vue3会在编译时识别静态内容，并将其提升到渲染函数之外，避免在每次渲染时重新创建：

```js
// 编译前
function render() {
  return h('div', [
    h('span', 'Static Text'),
    h('span', this.dynamicText)
  ])
}

// 编译后
const hoisted = h('span', 'Static Text')
function render() {
  return h('div', [
    hoisted,
    h('span', this.dynamicText)
  ])
}
```


### PatchFlag标记

Vue3会在编译时为动态内容添加标记，指示其动态部分：

```js
// 编译后的渲染函数
function render() {
  return h('div', [
    h('span', 'Static Text'),
    h('span', this.dynamicText, 1 /* TEXT */)
  ])
}
```


数字`1`是PatchFlag，表示只有文本内容是动态的。这使得运行时可以跳过静态内容的比对，只关注动态部分。

### 块树结构

Vue3引入了Block概念，将具有相同PatchFlag的节点组织在一起，进一步优化更新性能：

```js
// 编译后的渲染函数
function render() {
  const _ctx = this
  return (_openBlock(), _createBlock('div', null, [
    _createVNode('span', null, 'Static Text'),
    _createVNode('span', null, _ctx.dynamicText, 1 /* TEXT */)
  ]))
}
```


这种结构使得框架可以直接访问需要更新的动态节点，而无需遍历整个树。

## Vue3虚拟DOM的优势

Vue3的虚拟DOM实现相比Vue2和其他框架有以下显著优势：

### 1. 更精细的更新粒度

通过PatchFlag和Block机制，Vue3能够精确定位需要更新的DOM部分，大幅减少不必要的比对和操作。

### 2. 更小的内存占用

优化的虚拟节点结构和静态提升机制减少了对象创建，降低了内存占用和垃圾回收压力。

### 3. 更好的编译时优化

Vue3的编译器能够在构建时进行更多优化，将更多工作从运行时转移到编译时，提升运行性能。

### 4. 更强的类型支持

完全用TypeScript重写的代码库提供了更好的类型推断和开发体验。

### 5. 更灵活的自定义渲染器API

Vue3提供了自定义渲染器API，使得开发者可以将Vue应用渲染到不同平台，如Canvas、WebGL、原生移动应用等。

## 总结

通过本文，我们深入了解了虚拟DOM的概念、基本实现和Vue3中的高级特性。虚拟DOM作为现代前端框架的核心技术，在提供声明式编程模型的同时，通过各种优化手段保证了高效的性能。

Vue3在虚拟DOM实现上的创新，如编译优化、PatchFlag标记和块树结构，使其在保持易用性的同时，显著提升了性能，特别是在大型应用和动态内容频繁更新的场景中。

理解虚拟DOM的工作原理，不仅有助于更好地使用Vue3框架，也能帮助开发者在构建复杂前端应用时做出更明智的技术决策。

## 参考资料

- [Vue3官方文档](https://v3.vuejs.org/guide/rendering-mechanism.html)
- [Vue3源码解析](https://github.com/vuejs/core/tree/main/packages/runtime-core)
- [Virtual DOM介绍](https://en.wikipedia.org/wiki/Virtual_DOM)
- [Vue3渲染器实现原理](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
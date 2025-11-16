// ==================== 优先级系统 ====================
// React 根据更新的来源分配不同的优先级
const Priority = {
  Immediate: 1,      // 立即执行（同步）
  UserBlocking: 2,   // 用户阻塞（用户交互，如点击）
  Normal: 3,         // 正常优先级（默认）
  Low: 4,            // 低优先级
  Idle: 5,           // 空闲时执行
};

// 根据优先级获取超时时间（毫秒）
function getTimeoutByPriority(priority) {
  switch (priority) {
    case Priority.Immediate:
      return 0;
    case Priority.UserBlocking:
      return 250;
    case Priority.Normal:
      return 5000;
    case Priority.Low:
      return 10000;
    case Priority.Idle:
      return Infinity;
    default:
      return 5000;
  }
}

// ==================== 全局变量 ====================
let nextUnitOfWork = null;        // 下一个要处理的工作单元
let workInProgressRoot = null;    // 正在构建的新 Fiber 树根节点
let currentRoot = null;           // 当前的 Fiber 树根节点（用于 Diff）
let deletions = [];               // 需要删除的节点列表
let currentPriority = Priority.Normal; // 当前任务的优先级

// ==================== Fiber 节点创建 ====================
function createFiber(element) {
  return {
    // 继承 VirtualElement 的属性
    type: element.type,
    props: element.props,
    
    // Fiber 链表指针
    child: null,
    sibling: null,
    return: null,
    
    // Diff 和副作用相关
    alternate: null,
    dom: null,
    effectTag: null,
  };
}

// ==================== DOM 操作 ====================
function createDOM(fiber) {
  // 文本节点
  if (fiber.type === 'TEXT') {
    return document.createTextNode(fiber.props.nodeValue);
  }
  
  // 普通元素节点
  const dom = document.createElement(fiber.type);
  
  // 设置属性（排除 children）
  Object.keys(fiber.props)
    .filter(key => key !== 'children')
    .forEach(name => {
      // 特殊处理 style 属性
      if (name === 'style' && typeof fiber.props[name] === 'string') {
        dom.setAttribute('style', fiber.props[name]);
      } else {
        // 其他属性直接设置
        dom[name] = fiber.props[name];
      }
    });
  
  return dom;
}

// 更新 DOM 属性
function updateDOM(dom, prevProps, nextProps) {
  // 移除旧的属性
  Object.keys(prevProps)
    .filter(key => key !== 'children')
    .forEach(name => {
      if (!(name in nextProps)) {
        dom[name] = '';
      }
    });
  
  // 设置新的属性
  Object.keys(nextProps)
    .filter(key => key !== 'children')
    .forEach(name => {
      if (prevProps[name] !== nextProps[name]) {
        if (name === 'style' && typeof nextProps[name] === 'string') {
          dom.setAttribute('style', nextProps[name]);
        } else {
          dom[name] = nextProps[name];
        }
      }
    });
}

// ==================== 协调子节点（Diff 算法简化版）====================
function reconcileChildren(workInProgress, elements) {
  let index = 0;
  let prevSibling = null;
  let oldFiber = workInProgress.alternate?.child; // 获取旧的子 Fiber 节点
  
  // 遍历新的子元素
  while (index < elements.length || oldFiber) {
    const element = elements[index];
    let newFiber = null;
    
    // 判断是否可以复用旧的 Fiber 节点
    const sameType = oldFiber && element && oldFiber.type === element.type;
    
    if (sameType) {
      // 类型相同，可以复用，标记为更新
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        return: workInProgress,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        child: null,
        sibling: null,
      };
    } else if (element) {
      // 新节点，需要创建，标记为新增
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        return: workInProgress,
        alternate: null,
        effectTag: 'PLACEMENT',
        child: null,
        sibling: null,
      };
    } else if (oldFiber) {
      // 旧节点被删除，标记为删除
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }
    
    // 移动到下一个旧 Fiber 节点
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    
    // 构建链表结构
    if (index === 0) {
      workInProgress.child = newFiber;
    } else if (newFiber) {
      prevSibling.sibling = newFiber;
    }
    
    if (newFiber) {
      prevSibling = newFiber;
    }
    index++;
  }
}

// ==================== 执行单个工作单元 ====================
function performUnitOfWork(workInProgress) {
  // 1. 创建或更新当前节点的真实 DOM（不挂载，在 Commit 阶段统一挂载）
  if (!workInProgress.dom) {
    workInProgress.dom = createDOM(workInProgress);
  }
  
  // 2. 处理子节点（协调算法）
  const elements = workInProgress.props.children || [];
  reconcileChildren(workInProgress, elements);
  
  // 3. 返回下一个工作单元（深度优先遍历）
  if (workInProgress.child) {
    return workInProgress.child;
  }
  
  // 没有子节点，找兄弟节点
  let nextFiber = workInProgress;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    // 没有兄弟节点，返回父节点继续向上查找
    nextFiber = nextFiber.return;
  }
  
  return null;
}

// ==================== 提交阶段：将变更应用到真实 DOM ====================
function commitRoot() {
  // 先删除需要删除的节点
  deletions.forEach(commitWork);
  deletions = [];
  
  // 提交整个 Fiber 树
  if (workInProgressRoot) {
    commitWork(workInProgressRoot.child);
    currentRoot = workInProgressRoot;
    workInProgressRoot = null;
  }
}

function commitWork(fiber) {
  if (!fiber) return;
  
  // 找到有 DOM 节点的父节点
  let domParentFiber = fiber.return;
  while (domParentFiber && !domParentFiber.dom) {
    domParentFiber = domParentFiber.return;
  }
  const domParent = domParentFiber?.dom;
  
  // 根据 effectTag 执行相应操作
  if (fiber.effectTag === 'PLACEMENT' && fiber.dom) {
    // 新增节点
    if (domParent) {
      domParent.appendChild(fiber.dom);
    } else if (fiber.return === null) {
      // 根节点，直接添加到容器
      // 这种情况不应该发生，因为根节点已经在 renderToDOM 中处理
    }
  } else if (fiber.effectTag === 'UPDATE' && fiber.dom) {
    // 更新节点
    updateDOM(
      fiber.dom,
      fiber.alternate.props,
      fiber.props
    );
  } else if (fiber.effectTag === 'DELETION') {
    // 删除节点
    if (fiber.dom) {
      // 找到父节点来删除
      let parentFiber = fiber.return;
      while (parentFiber && !parentFiber.dom) {
        parentFiber = parentFiber.return;
      }
      if (parentFiber && parentFiber.dom) {
        parentFiber.dom.removeChild(fiber.dom);
      }
    }
  }
  
  // 递归处理子节点和兄弟节点
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

// ==================== 调度器：工作循环 ====================
// 使用 requestIdleCallback 在浏览器空闲时执行，如果不支持则使用 setTimeout 降级
const scheduleCallback = requestIdleCallback;

function workLoop(deadline) {
  let shouldYield = false; // 是否应该让出控制权
  
  // 根据优先级决定是否让出控制权
  const timeout = getTimeoutByPriority(currentPriority);
  const timeRemaining = deadline.timeRemaining ? deadline.timeRemaining() : 5;
  const hasTimeRemaining = timeRemaining > 1;
  const shouldTimeout = deadline.didTimeout || (Date.now() - startTime) > timeout;
  
  // 高优先级任务或还有时间，继续执行
  while (nextUnitOfWork && !shouldYield) {
    // 执行当前工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    
    // 检查是否应该让出控制权
    // 高优先级任务：立即执行，不让出
    // 低优先级任务：时间用完了就让出
    if (currentPriority === Priority.Immediate) {
      shouldYield = false; // 立即优先级，不让出
    } else {
      shouldYield = !hasTimeRemaining || shouldTimeout;
    }
  }
  
  // 如果还有工作未完成，继续调度
  if (nextUnitOfWork) {
    scheduleCallback(workLoop);
  } else {
    // 所有工作完成，进入 Commit 阶段
    commitRoot();
  }
}

let startTime = Date.now();

// ==================== 渲染入口函数 ====================
function renderToDOM(element, container, priority = Priority.Normal) {
  // 设置当前任务优先级
  currentPriority = priority;
  startTime = Date.now();
  
  // 创建根 Fiber 节点
  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot, // 指向旧的 Fiber 树根节点
    child: null,
    sibling: null,
    return: null,
    effectTag: null,
  };
  
  // 协调根节点的子节点
  reconcileChildren(workInProgressRoot, [element]);
  
  // 设置第一个工作单元（从根节点的第一个子节点开始）
  nextUnitOfWork = workInProgressRoot.child;
  
  // 开始调度
  if (currentPriority === Priority.Immediate) {
    // 立即优先级，同步执行
    while (nextUnitOfWork) {
      nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    commitRoot();
  } else {
    // 其他优先级，异步执行
    scheduleCallback(workLoop);
  }
  
  return workInProgressRoot;
}

// ==================== 导出优先级常量 ====================
window.Priority = Priority;

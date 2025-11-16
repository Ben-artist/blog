// 判断是否是 VirtualElement（即 ReactElement）
function isVirtualElement(e) {
  return typeof e === 'object' && e !== null;
}

// 创建文本节点的虚拟 DOM
function createTextElement(text) {
  return {
    type: 'TEXT',
    props: {
      nodeValue: text,
    },
  };
}

// 创建虚拟 DOM 元素（VirtualElement / ReactElement）
function createElement(type, props = {}, ...children) {
  const childrenElements = children.map(child =>
    isVirtualElement(child) ? child : createTextElement(String(child))
  );

  return {
    type,
    props: {
      ...props,
      children: childrenElements,
    },
  };
}


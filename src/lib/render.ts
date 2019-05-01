import { VirtualNode } from "./create-element";

const renderElement = (vNode: VirtualNode): HTMLElement => {
  const { attributes, children, tagName } = vNode;
  const $element = document.createElement(tagName);

  for (const [key, value] of Object.entries(attributes)) {
    $element.setAttribute(key, value);
  }

  for (const child of children) {
    $element.appendChild(render(child));
  }

  return $element;
};

export const render = (vNode: VirtualNode): HTMLElement | Text =>
  typeof vNode !== 'string'
    ? renderElement(vNode)
    : document.createTextNode(vNode);

import { VirtualNode } from "./create-element";
import { render } from "./render";
import { zip } from "./utils";

const differenceBetweenAttributes = (oldAttributes: object, newAttributes: object): ($node: HTMLElement) => HTMLElement => {
  const patches = [];

  for (const [key, value] of Object.entries(newAttributes)) {
    patches.push(($node: HTMLElement) => {
      $node.setAttribute(key, value);

      return $node;
    });
  }

  for (const property in Object.entries(oldAttributes)) {
    if (!(property in newAttributes)) {
      patches.push(($node: HTMLElement) => {
        $node.removeAttribute(property);

        return $node;
      });
    }
  }

  return ($node: HTMLElement) => {
    for (const patch of patches) {
      patch($node);
    }
    return $node;
  };
}

const differenceBetweenChildren = (oldVChildren: VirtualNode[], newVChildren: VirtualNode[]) => {
  const childPatches: (($node: ChildNode | HTMLElement | Text) => HTMLElement | Text)[] = [];


  oldVChildren.forEach((oldVChild, i) => {
    const newVChild = newVChildren[i];

    childPatches.push(differenceBetween(oldVChild, newVChild));
  });

  const additionalPatches: (($node: HTMLElement | Text) => HTMLElement | Text)[] = [];

  for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
    additionalPatches.push(($node: HTMLElement | Text) => {
      $node.appendChild(render(additionalVChild));
      return $node;
    });
  }

  return ($parent: HTMLElement | Text) => {
    for (const [patch, $child] of zip(childPatches, Array.from($parent.childNodes))) {
      patch($child);
    }

    for (const patch of additionalPatches) {
      patch($parent);
    }
    return $parent;
  };
}

export const differenceBetween = (oldVTree: VirtualNode, newVTree: VirtualNode): ($node: ChildNode | HTMLElement | Text) => HTMLElement | Text => {
  if (newVTree === undefined) {
    return ($node: ChildNode | HTMLElement | Text) => {
      $node.remove();

      return undefined;
    }
  }

  if (typeof oldVTree === 'string' || typeof newVTree === 'string') {
    if (oldVTree !== newVTree) {
      return ($node: ChildNode | HTMLElement | Text): HTMLElement | Text => {
         const $newNode = render(newVTree);
         $node.replaceWith($newNode);

         return $newNode;
       };
    } else {
      return ($node: Text) => $node;
    }
  }

  if (oldVTree.tagName !== newVTree.tagName) {
    return ($node: ChildNode | HTMLElement | Text): HTMLElement | Text => {
      const $newNode = render(newVTree);
      $node.replaceWith($newNode);

      return $newNode;
    };
  }

  const patchAttributes = differenceBetweenAttributes(oldVTree.attributes, newVTree.attributes);
  const patchChildren = differenceBetweenChildren(oldVTree.children, newVTree.children);

  return ($node: HTMLElement): HTMLElement => {
    patchAttributes($node);
    patchChildren($node);

    return $node;
  };
}

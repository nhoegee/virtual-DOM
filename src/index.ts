const createElement = (tagName, { attrs = {}, children = [] } = {}) => {
  const vElem = Object.create(null);

  Object.assign(vElem, {
    attrs,
    children,
    tagName
  });

  return vElem;
};


const renderElem = ({ tagName, attrs, children}) => {
  const $el = document.createElement(tagName);

  for (const [k, v] of Object.entries(attrs)) {
    $el.setAttribute(k, v);
  }

  for (const child of children) {
    $el.appendChild(render(child));
  }

  return $el;
};

const render = (vNode) => {
  if (typeof vNode === 'string') {
    return document.createTextNode(vNode);
  }

  return renderElem(vNode);
};

const mount = ($node, $target) => {
  $target.replaceWith($node);
  return $node;
}

const diffAttrs = (oldAttrs, newAttrs) => {
  const patches = [];

  for (const [k, v] of Object.entries(newAttrs)) {
    patches.push($node => {
      $node.setAttribute(k, v);
      return $node;
    });
  }

  for (const k in oldAttrs) {
    if (!(k in newAttrs)) {
      patches.push($node => {
        $node.removeAttribute(k);
        return $node;
      });
    }
  }

  return $node => {
    for (const patch of patches) {
      patch($node);
    }
    return $node;
  };
};

const zip = (xs, ys) => {
  const zipped = [];
  for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
    zipped.push([xs[i], ys[i]]);
  }
  return zipped;
};

const diffChildren = (oldVChildren, newVChildren) => {
  const childPatches = [];
  oldVChildren.forEach((oldVChild, i) => {
    childPatches.push(diff(oldVChild, newVChildren[i]));
  });

  const additionalPatches = [];
  for (const additionalVChild of newVChildren.slice(oldVChildren.length)) {
    additionalPatches.push($node => {
      $node.appendChild(render(additionalVChild));
      return $node;
    });
  }

  return $parent => {
    for (const [patch, $child] of zip(childPatches, $parent.childNodes)) {
      patch($child);
    }

    for (const patch of additionalPatches) {
      patch($parent);
    }
    return $parent;
  };
}

const diff = (oldVTree, newVTree) => {
  if (newVTree === undefined) {
    return $node => {
      $node.remove();
      return undefined;
    }
  }

  if (typeof oldVTree === 'string' ||
    typeof newVTree === 'string') {
    if (oldVTree !== newVTree) {
      return $node => {
         const $newNode = render(newVTree);
         $node.replaceWith($newNode);
         return $newNode;
       };
    } else {
      return $node => $node;
    }
  }

  if (oldVTree.tagName !== newVTree.tagName) {
    return $node => {
      const $newNode = render(newVTree);
      $node.replaceWith($newNode);
      return $newNode;
    };
  }

  const patchAttrs = diffAttrs(oldVTree.attrs, newVTree.attrs);
  const patchChildren = diffChildren(oldVTree.children, newVTree.children);

  return $node => {
    patchAttrs($node);
    patchChildren($node);
    return $node;
  };
}

const createVApp = count => createElement('div', {
  attrs: {
    id: 'app',
    dataCount: count, // we use the count here
  },
  children: [
    'The current count is: ',
    String(count), // and here
    ...Array.from({ length: count }, () => createElement('img', {
      attrs: {
        src: 'https://media.giphy.com/media/cuPm4p4pClZVC/giphy.gif',
      },
    })),
  ],
});

let vApp = createVApp(0);
const $app = render(vApp);
let $rootEl = mount($app, document.getElementById('app'));

setInterval(() => {
  const n = Math.floor(Math.random() * 10);
  const vNewApp = createVApp(n);
  const patch = diff(vApp, vNewApp);

  // we might replace the whole $rootEl,
  // so we want the patch will return the new $rootEl
  $rootEl = patch($rootEl);

  vApp = vNewApp;
}, 1000);

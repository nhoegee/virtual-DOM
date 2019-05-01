import { createElement } from "./lib/create-element";
import { render } from "./lib/render";
import { mount } from "./lib/mount";
import { differenceBetween } from "./lib/difference-between";

const createVApp = count => createElement('div', {
  attributes: {
    id: 'app',
    dataCount: count, // we use the count here
  },
  children: [
    'The current count is: ',
    String(count), // and here
    ...Array.from({ length: count }, () => createElement('img', {
      attributes: {
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
  const patch = differenceBetween(vApp, vNewApp);

  // we might replace the whole $rootEl,
  // so we want the patch will return the new $rootEl
  $rootEl = patch($rootEl);

  vApp = vNewApp;
}, 1000);

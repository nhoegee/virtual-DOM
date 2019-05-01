export const mount = ($node: HTMLElement | Text, $target: HTMLElement): HTMLElement | Text => {
  $target.replaceWith($node);
  return $node;
}
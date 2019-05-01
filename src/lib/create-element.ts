type Options = {
  attributes: object;
  children: Array<any>;
};

export type VirtualNode = {
  attributes: object;
  children: Array<any>;
  tagName: string;
}

export const createElement = (tagName: string, options: Partial<Options>): VirtualNode => {
  const { attributes = {}, children = [] } = options;

  return {
    attributes,
    children,
    tagName
  };
};

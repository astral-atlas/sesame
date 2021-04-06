// @flow strict
/*::
declare module "preact" {
  declare opaque type Element;
  declare type Node =
    | Element
    | Node[]
    | null
    | string;
  
  declare type Component<T> = (props: T) => Node;
  declare var createElement: <T = {| children: Node |}>(
    component: Component<T> | string,
    props: {| ...T, children?: $PropertyType<T, 'children'> |},
    children?: Node
  ) => Element

  declare type Context<T> = { Provider: Component<{ children: Node, value: T }>, Consumer: Component<{ children: T => Node }> }
  declare var createContext: <T>(defaultContent: T) => Context<T>;

  declare var render: <T>(node: Node, element: HTMLElement) => void;

  declare module.exports: {
    createElement: typeof createElement,
    h: typeof createElement,
    render: typeof render,
    createContext: typeof createContext,
  }
}

declare module "preact/hooks" {
  import type { Context } from 'preact';

  declare type Updater<T> = (update: T | (T => T)) => void;

  declare var useContext: <T>(context: Context<T>) => T; 
  declare var useState: <T>(initialState: T) => [T, Updater<T>];
  declare var useEffect: (effect: () => (void | () => void), dependencies?: mixed[]) => void;
  declare var useRef: <T>(initial: T) => { current: T };
  declare var useMemo: <T>(calc: () => T, dependencies?: mixed[]) => T;

  declare module.exports: {
    useContext: typeof useContext,
    useMemo: typeof useMemo,
    useState: typeof useState,
    useEffect: typeof useEffect,
    useRef: typeof useRef,
  }
}

*/
/* SystemJS module definition */
declare var module: NodeModule;

interface NodeModule {
  id: string;
}

// support json import
declare module '*.json' {
  const value: any;
  export default value;
}

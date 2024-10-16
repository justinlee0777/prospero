type Constructor<Instance, Arguments extends Array<unknown>> = new (
  ...args: Arguments
) => Instance;

export default Constructor;

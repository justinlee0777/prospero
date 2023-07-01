type Constructor<Instance, Arguments extends Array<unknown> | undefined> = new (
  ...args: Arguments
) => Instance;

export default Constructor;

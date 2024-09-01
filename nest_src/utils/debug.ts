export const debug = (...args): void => {
  const names = args.map((arg) => Object.keys(arg));
  const values = args.map((arg) => Object.values(arg));
  console.log(`[${names}]=[${values}]`);
};

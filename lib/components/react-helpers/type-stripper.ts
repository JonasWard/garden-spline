export const trimType = <T extends string, U extends object & { type: T }>(axis: U): Omit<U, 'type'> => {
  const s = { ...axis };
  delete (s as Omit<U, 'type'> & { type?: U['type'] }).type;
  return s;
};

const arrayIntersect = (array1, array2) => {
  return array1.filter(value => array2.includes(value));
};

const arraysHaveIntersect = (array1, array2) => {
  const intersect = arrayIntersect(array1, array2);
  return intersect.length > 0;
};

export { arrayIntersect, arraysHaveIntersect };

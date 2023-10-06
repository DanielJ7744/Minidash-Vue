/**
 * Traverse through a JSON object to create a tree like structure for displaying in the front-end
 */
const traverse = (jsonObject, path = []) => {
  const tree = [];
  for (const i of Object.keys(jsonObject)) {
    const itemPath = path.concat(i);
    const joinedPath = itemPath.join('.');
    if (jsonObject[i] !== null && typeof jsonObject[i] === 'object') {
      tree.push({
        key: joinedPath,
        label: i,
        data: joinedPath,
        children: traverse(jsonObject[i], itemPath),
        leaf: true,
      });
    } else {
      tree.push({ key: joinedPath, label: i });
    }
  }
  return tree;
};

/**
 * Get a mapping file from the mappings endpoint by using a passed in name
 */
const getMapping = (http, mappingName) => {
  return http.$get(`/api/api/v2/mappings/${mappingName}`);
};

export { traverse, getMapping };

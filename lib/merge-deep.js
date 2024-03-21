function isObject(item) {
  return (item && typeof item === 'object' && !Array.isArray(item));
}

function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

module.exports = mergeDeep;

// Usage
/*
const obj1 = { a: 1, b: { c: 1 } };
const obj2 = { b: { c: 2, d: 2 }, e: 3 };

const result = mergeDeep({}, obj1, obj2);
console.log(result);
// Output: { a: 1, b: { c: 2, d: 2 }, e: 3 }
*/

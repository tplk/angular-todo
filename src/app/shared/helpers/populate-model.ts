export const populateModel = <T>(model: T, obj: any): T => {
  Object.keys(model).forEach((key) => {
    if (obj.hasOwnProperty(key)) {
      model[key] = obj[key];
    }
  });
  return model;
};

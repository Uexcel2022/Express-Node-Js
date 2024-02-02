exports.date = () => {
  const date = Date.now() + 60 * 60 * 1000;
  const localDate = new Date(date);
  return localDate; //WAT
};

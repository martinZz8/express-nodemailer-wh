const getStrOrDash = (str) => {
  if (str.length > 0) {
    return str;
  }

  return "-";
};

module.exports = {
  getStrOrDash: getStrOrDash
};
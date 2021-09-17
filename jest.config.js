module.exports = {
  roots: ["<rootDir>/src"],
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(t|j)sx?$",
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};

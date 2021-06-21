module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // https://stackoverflow.com/questions/50411719/shared-utils-functions-for-testing-with-jest/52910794
  globals: {
    "ts-jest": {
      tsconfig: "tsconfig.test.json",
    },
  },

  // // https://www.youtube.com/watch?v=7XUFVQh6XAQ&ab_channel=BenAwad
  globalSetup: "<rootDir>/__tests__/setup.ts",
  // globalTeardown: "<rootDir>/__tests__/teardown.ts",

  // setupFiles: [ "<rootDir>/__tests__/setup.ts", ],
  // // teardownFiles: [ "<rootDir>/__tests__/teardown.ts", ],

  modulePathIgnorePatterns: [
    "/node_modules/",
    "<rootDir>/__tests__/test-utils.ts",
    "<rootDir>/__tests__/setup.ts",
    "<rootDir>/__tests__/teardown.ts",
  ]
};
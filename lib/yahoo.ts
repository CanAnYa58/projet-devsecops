// yahoo-finance2 v3 requires instantiation with `new`
// eslint-disable-next-line @typescript-eslint/no-require-imports
const YahooFinanceClass = require("yahoo-finance2").default;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const yahooFinance: any = new YahooFinanceClass({
  suppressNotices: ["yahooSurvey"],
});

export default yahooFinance;

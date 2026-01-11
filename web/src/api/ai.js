import API from "./config";

export const checkSpamReport = (data) =>
  API.post("/ai/check-report", data);

const momoent = require("moment");
function formatMessage(username, text) {
  return {
    username,
    text,
    time: momoent().format("h:mm a"),
  };
}

module.exports = formatMessage;

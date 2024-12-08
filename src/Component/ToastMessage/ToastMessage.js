import React from "react";
import { message } from "antd";

// import { options } from "../../Config/options";

const ToastMessage = (STATUS, MESSAGE) => {
  return message[STATUS.toLowerCase()](MESSAGE);
};

export default ToastMessage;

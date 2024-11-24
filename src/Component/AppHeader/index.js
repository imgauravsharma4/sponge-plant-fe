import {  Button, Space,  } from "antd";
import React  from "react";

function AppHeader() {

  return (
    <div className="AppHeader">
      <div>Home</div>
      <Space>
        <Button>Login</Button>
        <Button>Sign up</Button>
      </Space>
    </div>
  );
}
export default AppHeader;

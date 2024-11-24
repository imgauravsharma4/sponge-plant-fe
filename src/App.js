import "./App.css";
import AppHeader from "./Component/AppHeader";
import SideMenu from "./Component/SideMenu";
import {  BrowserRouter } from "react-router-dom";

import PageContent from "./Component/PageContent";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <AppHeader />
        <div className="SideMenuAndPageContent">
          <SideMenu />
          <PageContent />
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;

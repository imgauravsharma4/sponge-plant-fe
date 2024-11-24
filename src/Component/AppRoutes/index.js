import {  Route, Routes } from "react-router-dom";
import Machine from "../../Pages/Machine";
import Material from "../../Pages/Material";

function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<Material />}></Route>
        <Route path="/machine" element={<Machine />}></Route>
      </Routes>
  );
}
export default AppRoutes;

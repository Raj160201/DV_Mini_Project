import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './App.css';
import Home from "./Components/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Home />} />
        {/* <Route exact path="/" element={<Home defaultCompany="INE002A01018%RIL" />} /> */}
      </Routes>
    </Router>
  );
}

export default App;

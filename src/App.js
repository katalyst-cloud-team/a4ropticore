import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { HomePage } from "./components/HomePage"
import SearchPage  from "./components/SearchPage"
import EventDetails from './components/EventDetails';
import { AboutPage } from "./components/AboutPage";
import StorageDetailsPage from "./components/StorageDetailsPage"
import { ReportPage } from "./components/ReportPage";
import { HelpPage } from "./components/HelpPage";
import StorageSearchPage from "./components/StorageSearchPage";

import "./App.css"

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/storagesearch" element={<StorageSearchPage/>} />
          <Route path="/events/:uuid" element={<EventDetails />} /> 
          <Route path="/storage/:ip" element={<StorageDetailsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App

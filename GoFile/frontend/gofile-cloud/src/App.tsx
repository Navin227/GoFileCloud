import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Converter from "./pages/tools/Converter";
import Merger from "./pages/tools/Merger";
import Compressor from "./pages/tools/Compressor";
import Summarizer from "./pages/tools/Summarizer";
import Splitter from "./pages/tools/Splitter";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/home" element={<Index />} />
        
        {/* Tool Routes */}
        <Route path="/tools/convert" element={<Converter />} />
        <Route path="/tools/merge" element={<Merger />} />
        <Route path="/tools/split" element={<Splitter />} />
        <Route path="/tools/compress" element={<Compressor />} />
        <Route path="/tools/summarize" element={<Summarizer />} />

        <Route path="*" element={<Navigate to="/home" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
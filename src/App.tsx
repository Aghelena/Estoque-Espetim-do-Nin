import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Historico from "./pages/Historico";
import Rendimento from "./pages/Rendimento";
import Itens from "./pages/Itens";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/rendimento" element={<Rendimento />} />
        <Route path="/itens" element={<Itens />} />
      </Routes>
    </Layout>
  );
}

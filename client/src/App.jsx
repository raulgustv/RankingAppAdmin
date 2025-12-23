import AppRouter from "./router/AppRouter";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './App.css'

const App = () => {
  return (
    <>
        <AppRouter />
        <ToastContainer position="bottom-center" autoClose={1500} />
    </>
      
  );
}

export default App;

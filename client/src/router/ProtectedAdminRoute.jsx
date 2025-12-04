import { useContext } from "react";
import { AdminAuthContext } from "../context/AdminAuthContext";
import Loading from "../components/Loading";
import { Navigate } from "react-router-dom";



const ProtectedAdminRoute = ({children}) =>{
    const {admin, loading} = useContext(AdminAuthContext)

    if(loading) return <div><Loading /></div>

    if(!admin || !admin?.token){
        return <Navigate to="/admin/login" replace />
    }

    if(admin?.role !== "Admin"){
        return <Navigate to="/forbidden" />
    }

    return children;
}

export default ProtectedAdminRoute

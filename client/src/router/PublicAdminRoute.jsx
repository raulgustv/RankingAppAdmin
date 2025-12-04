import { useContext } from "react"
import { AdminAuthContext } from "../context/AdminAuthContext"
import Loading from "../components/Loading";
import { Navigate } from "react-router-dom";

 

const PublicAdminRoute = ({children}) => {

    const {loading, admin} = useContext(AdminAuthContext);

    if (loading) return <Loading />

    if(admin && admin?.token){
        return <Navigate to="/admin/dashboard" replace />
    }

  return children
}

export default PublicAdminRoute
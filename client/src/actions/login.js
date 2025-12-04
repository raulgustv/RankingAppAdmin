import axiosInstance from '../API/axios';
import { toast } from 'react-toastify';


export const adminLogin = async(values) =>{
    
    try {

        const {data} = await axiosInstance.post('/admin/admin-login', values);        

        return{
            ok: true,
            token: data.token,
            admin: data.admin
        }
        
    } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.error || "Login failed")
        return{
            ok: false,
            admin: null,
            token: null
        }
    }

}
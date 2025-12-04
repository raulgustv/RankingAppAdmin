import axiosInstance from '../API/axios';
import { toast } from 'react-toastify';


export const newPlayer = async(values) =>{
    
    try {
        const {data} = await axiosInstance.post('/ranking/new-player', values);        

        return{
            ok: true,
            data
        }
        
    } catch (error) {
        console.log(error)
        toast.error(error.response?.data?.errors[0]?.msg || "Failed to create player")
        return{
            ok: false,
            data: error.response
        }
    }

}

import { toast } from "react-toastify"
import axiosInstance from "../API/axios"


export const getActivePlayers = async() =>{
    try {

        const {data} = await axiosInstance.get('/admin/ranking-players')

        return{
            ok: true,
            players: data.players
        }
        
    } catch (error) {
        console.log(error)
        toast.error(error || 'No se han podido obtener jugadores activos')
        return{
            ok: false,
            players: null
        }
    }
}

export const deactivatePlayer = async(id) =>{
    try {
        const {data} = await axiosInstance.put(`/admin/deactivate-player/${id}`)
        return data
    } catch (error) {
        console.log(error)
    }
}

export const activatePlayer = async(id) =>{
    try {
        const {data} = await axiosInstance.put(`/admin/reactivate-player/${id}`)
        
        return data
    } catch (error) {
        console.log(error)

    }
}
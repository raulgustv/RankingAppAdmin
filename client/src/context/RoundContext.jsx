import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../API/axios";

const RoundsContext = createContext();

export const RoundsProvider = ({children}) => {

    const [rounds, setRounds] = useState([]);
    const [loading, setLoading] = useState(false)

    const fetchRounds = async() =>{
        try {
            setLoading(true)
            const {data} = await axiosInstance.get('/admin/status-rounds')
            setRounds(data)
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() =>{
        fetchRounds()    
    }, [])

  return (
        <RoundsContext.Provider value={{rounds, loading, fetchRounds}}>
            {children}
        </RoundsContext.Provider>
  )
};


export const useRounds = () => useContext(RoundsContext)

import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../API/axios";

const PlayersContext = createContext();

export const PlayersProvider = ({children}) => {

    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(false)

    const fetchPlayers = async() =>{
        try {
            setLoading(true)
            const {data} = await axiosInstance.get('/admin/view-players')
            setPlayers(data)
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() =>{
        fetchPlayers()    
    }, [])

  return (
        <PlayersContext.Provider value={{players, loading, fetchPlayers}}>
            {children}
        </PlayersContext.Provider>
  )
};


export const usePlayers = () => useContext(PlayersContext)

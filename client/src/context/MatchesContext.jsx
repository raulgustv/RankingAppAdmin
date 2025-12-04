import { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "../API/axios";

const MatchesContext = createContext();

export const MatchesProvider = ({children}) => {

    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(false)

    const fetchMatches = async() =>{
        try {
            setLoading(true)
            const {data} = await axiosInstance.get('/match/view-matches')
            setMatches(data.matches)
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false)
        }
    }

    useEffect(() =>{
        fetchMatches()    
    }, [])

  return (
        <MatchesContext.Provider value={{matches, loading, fetchMatches}}>
            {children}
        </MatchesContext.Provider>
  )
};


export const useMatches = () => useContext(MatchesContext)

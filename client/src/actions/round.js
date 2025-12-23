import axiosInstance from "../API/axios"

export const updateRound = async(date, id) =>{
    try {

        const {data} = await axiosInstance.put(`/match/update-round/${id}`,{
            endDate: date
        })

        return data
        
    } catch (error) {
        console.log(error)
        return error
    }
    
}
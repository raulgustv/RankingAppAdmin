import axiosInstance from "../API/axios"

export const saveMatchResults = (matchId, sets) =>{

    //console.log(matchId, sets)

    const body = {
        matchId: matchId,
        sets: sets
    }

    return axiosInstance.post('/match/result', body)
}
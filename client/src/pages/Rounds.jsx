import {Button, Typography, Alert, Modal, DatePicker} from 'antd'
import Players from "../components/Players"
import {PlayCircleOutlined} from "@ant-design/icons";
import { useEffect, useState } from 'react';
import axiosInstance from '../API/axios';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useMatches } from '../context/MatchesContext';
import { useRounds } from '../context/RoundContext';


const Rounds = () => {

    const {Title} = Typography;

    const {fetchMatches} = useMatches();
    const {rounds} = useRounds();

    const currentRound = rounds.find(r => r.completed === false)

    const [playerCount, setPlayerCount] = useState(0)
    const [firstRound, setFirstRound] = useState(false)

    // modal + fecha
    const [openDateModal, setOpenDateModal] = useState(false)
    const [roundDate, setRoundDate] = useState(null)

    // Saber si estamos generando la primera ronda o la siguiente
    const [isNextRound, setIsNextRound] = useState(false)
    
    useEffect(() =>{
        const loadRounds = async() =>{
            const res = await axiosInstance.get('/admin/status-rounds');
            setFirstRound(res.data)
        }
        loadRounds()
    }, [])

    const isFirstRoundAvailable = Array.isArray(firstRound)
    ? firstRound.length > 0
    : (typeof firstRound === 'number' ? firstRound > 0 : Boolean(firstRound));


    // Primera ronda -> abrir modal
    const handleGenerateFirstRound = () =>{
        setIsNextRound(false)     
        setOpenDateModal(true)
    }    

    // Nueva ronda -> abrir modal también
    const handleGenerateNextRound = () =>{
        setIsNextRound(true)           // Es siguiente ronda
        setOpenDateModal(true)
    }

    const handleConfirmDate = async() =>{
        if(!roundDate) return;

        try {

            const url = isNextRound
                ? '/match/next-round'
                : '/match/first-round';

            const {data} = await axiosInstance.post(url, {startDate: roundDate})

            toast.success(
                `${data.message}, total players: ${data.totalPlayers} with ${data.totalMatches} matches`
            )

            await fetchMatches();

            setOpenDateModal(false)
            setRoundDate(null)
            
        } catch (error) {
            console.log(error)
            toast.error(error?.response?.data?.error)
        }
    }


    return (
        <div>
            <Title level={3}>Round management</Title>

            { isFirstRoundAvailable ? (
     
                <Button
                    type='primary'
                    icon={<PlayCircleOutlined />}
                    onClick={handleGenerateNextRound}
                    style={{ marginBottom: 16 }}
                    disabled={playerCount < 10 || currentRound?.completed === false}
                >
                    Generate next round
                </Button>


            ) : (
                <Button
                    type='primary'
                    icon={<PlayCircleOutlined />}
                    onClick={handleGenerateFirstRound}
                    style={{ marginBottom: 16 }}
                    disabled={playerCount < 10}
                >
                    Generate first round
                </Button>
            ) }

            {/* MODAL DATE PICKER */}
            <Modal 
                title={isNextRound ? "Select date for next round" : "Select date for first round"} 
                open={openDateModal}
                onCancel={() => setOpenDateModal(false)}
                onOk={handleConfirmDate}
                okButtonProps={{disabled: !roundDate}}
            >
                <p>Please select a date</p>

                <DatePicker
                    style={{width: "100%"}}
                    format="DD/MM/YYYY"
                    onChange={(value) =>{
                        setRoundDate(value ? dayjs(value).format("YYYY-MM-DD") : null)
                    }}
                    placeholder='Please select a date'
                />
            </Modal>

            {playerCount < 10 && (
              <Alert
                message={`10 players are needed to start a round. Current players: ${playerCount}`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {currentRound?.completed === false && (
              <Alert
                message={`Round ${currentRound?.roundNumber} not completed. Please make sure all matches are complete before generating next round`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            
            <Players onPlayersLoaded={setPlayerCount} />
        </div>

    )
}

export default Rounds

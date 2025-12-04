import { Card, Table, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { getActivePlayers } from '../actions/getPlayers'

const Players = ({onPlayersLoaded}) => {

    const [loading, setLoading] = useState(false);
    const [players, setPlayers] = useState([])

    const playersTotal = players.length

    useEffect(() =>{

        let isMounted = true;
        setLoading(true)

        const loadActivePlayers = async() =>{
            const res = await getActivePlayers();
            if(isMounted && res.ok){
                setPlayers(res.players.sort((a,b) => a.ranking - b.ranking))
                onPlayersLoaded(res.players.length)
            }
        };

        loadActivePlayers();
        setLoading(false)

        return() =>{
            isMounted = false
        }
    }, [onPlayersLoaded]);

    
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            key: "name",
            render: (text) => <b>{text}</b>
        },
        {
            title: "Last name",
            dataIndex: "lastName",
            key: "lastName",
        },
        {
            title: "NTRP Level",
            dataIndex: "utrLevel",
            key: "utrLevel",
            render: (utr) => <span style={{fontWeight: 600}}>{utr}</span>
        },
        {
            title: "Current Rank",
            dataIndex: "ranking",
            key: "ranking",
            render: (ranking) => <span style={{fontWeight: 600}}>{ranking}</span>
        }
    ];
    
    const {Title} = Typography


  return (
    <Card>
        <Title level={3}>
            {`Active ranking participants ${playersTotal}`}
        </Title>

        <Table
            columns={columns}
            dataSource={players}
            rowKey="_id"
            loading={loading}
            pagination={{
                pageSize: 5,
                showSizeChanger: true,
                pageSizeOptions: [5, 10, 20],
                showTotal: (total) => `${total} jugadores`
            }}
        />
    </Card>
  )
}

export default Players
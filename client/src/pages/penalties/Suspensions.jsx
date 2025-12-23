import { Row, Col, Collapse, List, Typography, Button, Skeleton } from "antd";
import { usePlayers } from "../../context/PlayerContext";
import dayjs from "dayjs";
import axiosInstance from "../../API/axios";
import { toast } from "react-toastify";



const Suspensions = () => {


    const { players, loading, fetchPlayers } = usePlayers();

    const { Text } = Typography;

    const suspendedPlayers = players.filter((p) => (p.suspendedNotes.length > 0) && (p.active === false))

    const handleUnsuspend = async(idPlayer) => {

        try {
            const { data } = await axiosInstance.put(`/penalty/unsuspend-player/${idPlayer}`)
            
            toast.success(data?.message)

        } catch (error) {
            console.log(error)
            toast.success('Error unsuspending player', error)
        }finally{
            fetchPlayers()
        }


    }

    return (
        <div>
            <Row gutter={[16, 16]}>
                {
                    suspendedPlayers.map((pl) => (
                        <Col span={6} key={pl?._id}>
                            <Skeleton loading={loading}>
                            <Collapse items={[
                                {
                                    key: pl?._id,
                                    label: (`${pl?.name} ${pl?.lastName}`),
                                    children: (
                                        <div>
                                            <List
                                                dataSource={pl?.suspendedNotes}
                                                renderItem={(n) => (
                                                    <List.Item>
                                                        <div>
                                                            <Text>{n.message} </Text>
                                                            <br />
                                                            <Text type="secondary">
                                                                {dayjs(n.date).format('DD/MM/YYYY')}
                                                            </Text>
                                                        </div>
                                                    </List.Item>
                                                )}
                                            />
                                            <Button
                                                variant="solid"
                                                color="primary"
                                                onClick={() => handleUnsuspend(pl._id)}>
                                                Unsuspend player
                                            </Button>
                                        </div>
                                    )
                                }
                            ]} />
                            </Skeleton>
                        </Col>
                    ))
                }
            </Row>
        </div>
    )
}

export default Suspensions

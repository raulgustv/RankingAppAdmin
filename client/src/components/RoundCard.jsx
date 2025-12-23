import {Row, Col, Card, Progress} from 'antd'
import { TrophyOutlined, HourglassOutlined, PlayCircleOutlined} from '@ant-design/icons';


const RoundCard = ({currentRound, matchesPending, roundProgress, matchesInCurrentRound}) => {

    const cardStyle = {
    borderRadius: 16,
    padding: "22px 16px",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    height: 260,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

    return (
        <>
            <Col xs={24} sm={12} md={8}>
                <Card hoverable style={cardStyle}>

                    <Row justify="space-between" align="middle">
                        <Col span={8}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <TrophyOutlined style={{ fontSize: 32, color: "green" }} />
                                <span style={{ fontSize: 13 }}>Current round</span>
                                <span style={{ fontSize: 28, fontWeight: "bold", color: "green" }}>{currentRound}</span>
                            </div>
                        </Col>

                        <Col span={8}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <HourglassOutlined style={{ fontSize: 32, color: "blue" }} />
                                <span style={{ fontSize: 13 }}>Pending matches</span>
                                <span style={{ fontSize: 28, fontWeight: "bold", color: "blue" }}>
                                    {matchesPending}
                                </span>
                            </div>
                        </Col>

                        <Col span={8}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <PlayCircleOutlined style={{ fontSize: 32, color: "yellowgreen" }} />
                                <span style={{ fontSize: 13 }}>Total matches</span>
                                <span style={{ fontSize: 28, fontWeight: "bold", color: "yellowgreen" }}>
                                    {matchesInCurrentRound.length}
                                </span>
                            </div>
                        </Col>
                    </Row>

                    <Progress
                        percent={roundProgress}
                        status={roundProgress === 100 ? 'success' : 'active'}
                    />

                </Card>
            </Col>
        </>
    )
}

export default RoundCard

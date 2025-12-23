import { Col, Card, Row, Typography, List } from 'antd';
import {StarFilled, TrophyFilled } from '@ant-design/icons';

const RoundWinnersCards = ({currentRoundWinners, matchesToComplete}) => {

    const {Title} = Typography

    return (
        <>

            <Col span={24}>
                <Card
                    hoverable
                    style={{
                        borderRadius: 16,
                        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
                        width: "100%",
                        padding: 20
                    }}
                >
                    <Row gutter={[24, 16]}>
                        <Col span={12}>
                            <Title level={4} style={{ marginBottom: 16 }}>
                                <StarFilled style={{ color: "#fadb14", marginRight: 8 }} />
                                Current round winners
                            </Title>

                            <List
                                itemLayout="horizontal"
                                dataSource={currentRoundWinners}
                                renderItem={player => (
                                    <List.Item
                                        style={{
                                            background: "#fafafa",
                                            borderRadius: 12,
                                            marginBottom: 12,
                                            padding: 12,
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.06)"
                                        }}
                                    >
                                        <List.Item.Meta
                                            avatar={<TrophyFilled style={{ color: '#fadb14' }} />}
                                            title={<span style={{ fontSize: 16, fontWeight: 600 }}>{player.name} {player.lastName}</span>}
                                        />
                                    </List.Item>
                                )}
                            />
                        </Col>

                        <Col span={12}>
                            <Title level={4} style={{ marginBottom: 16 }}>
                                <StarFilled style={{ color: "#fadb14", marginRight: 8 }} />
                                Pending matches
                            </Title>

                            <List
                                itemLayout="horizontal"
                                dataSource={matchesToComplete}
                                renderItem={mp => (
                                    <List.Item
                                        style={{
                                            background: "#fafafa",
                                            borderRadius: 12,
                                            marginBottom: 12,
                                            padding: 12,
                                            boxShadow: "0 4px 10px rgba(0,0,0,0.06)"
                                        }}
                                    >
                                        <List.Item.Meta
                                            title={
                                                <div style={{ textAlign: 'center' }}>
                                                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                                                        {mp?.player1?.name} {mp?.player1?.lastName} vs {mp?.player2?.name} {mp?.player2?.lastName}
                                                    </span>
                                                </div>
                                            }
                                        />
                                    </List.Item>
                                )}
                            />
                        </Col>
                    </Row>
                </Card>
            </Col>
        </>
    )
}

export default RoundWinnersCards



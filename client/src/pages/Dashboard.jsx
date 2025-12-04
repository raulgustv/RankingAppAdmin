import { Divider, Typography, Row, Col, Card, Progress, Statistic, List } from 'antd';
import { TrophyOutlined, HourglassOutlined, PlayCircleOutlined, CalendarOutlined, ClockCircleOutlined, StarFilled, TrophyFilled } from '@ant-design/icons';
import { useRounds } from "../context/RoundContext";
import { useMatches } from "../context/MatchesContext";

import dayjs from 'dayjs';
import WeatherCard from '../components/WeatherCard';

const Dashboard = () => {

  const { Title } = Typography;
  const { Timer } = Statistic;

  const { rounds } = useRounds();
  const { matches } = useMatches();

  let currentRoundData = rounds.find(r => r.completed === false);

  if(!currentRoundData && rounds.length > 0){
    currentRoundData = rounds[rounds.length - 1]
  }

  const currentRound = rounds.length;
  const matchesInCurrentRound = matches.filter(m => m?.round === currentRound && m?.isBye === false);

  const matchesToComplete = matchesInCurrentRound.filter(m => m?.completed === false && m?.isBye === false)
  const matchesPending = matchesToComplete.length
  
  const currentRoundWinners = currentRoundData?.winners

  const roundProgress = Math.round(100-((matchesPending / matchesInCurrentRound.length) * 100));

  const roundStartDate = dayjs(currentRoundData?.startDate).format('DD/MM/YYYY');
  const roundEndDate = dayjs(currentRoundData?.endDate).valueOf()


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
    <div style={{ padding: '24px' }}>

      {/* TITLE + WEATHER */}
      <Row gutter={[16, 24]}>    
        <Col span={8}>
          <Title level={2}>Main dashboard</Title>
        </Col>

        <Col span={16}>
            <WeatherCard />
        </Col>
     </Row>
      
      <Divider />

      <Row gutter={[24, 24]}>

        {/* CARD 1 - ROUND SUMMARY */}
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

        {/* CARD 2 - ROUND DATES */}
        <Col xs={24} sm={12} md={16}>
          <Card hoverable style={cardStyle}>

            <Row justify="space-between" align="middle">
              <Col span={12}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <CalendarOutlined style={{ fontSize: 32, color: "grey" }} />
                  <span style={{ fontSize: 13 }}>Round start date</span>
                  <span style={{ fontSize: 20, fontWeight: "bold" }}>{roundStartDate}</span>
                </div>
              </Col>

              <Col span={12}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <CalendarOutlined style={{ fontSize: 32, color: "grey" }} />
                  <span style={{ fontSize: 13 }}>Round end date</span>
                  <span style={{ fontSize: 20, fontWeight: "bold" }}>{dayjs(roundEndDate).format('DD/MM/YYYY')}</span>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: "16px 0" }} />

            <div style={{ display: "flex", justifyContent: "flex-end", paddingRight: 20 }}>
              <span><ClockCircleOutlined />  </span>
              <Timer
                type='countdown'
                title="Round ends in: "
                value={roundEndDate.valueOf()}
                format={'D [Days;] HH[H] mm[min] ss[secs]'}
              />
            </div>

          </Card>
        </Col>

        {/* CARD 3 - CURRENT ROUND WINNERS */}
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
                        avatar={<TrophyFilled style={{color: '#fadb14'}} />}
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
                          <div style={{textAlign: 'center'}}>
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

      </Row>
    </div>
  );
};

export default Dashboard;

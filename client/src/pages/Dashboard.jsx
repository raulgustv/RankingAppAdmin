import { Divider, Typography, Row, Col } from 'antd';
import { useRounds } from "../context/RoundContext";
import { useMatches } from "../context/MatchesContext";

import dayjs from 'dayjs';
import WeatherCard from '../components/WeatherCard';
import RoundCard from '../components/RoundCard';
import RoundDates from '../components/RoundDates';
import RoundWinnersCards from '../components/RoundWinnersCards';

const Dashboard = () => {

  const { Title } = Typography;

  const { rounds } = useRounds();
  const { matches } = useMatches();

  let currentRoundData = rounds.find(r => r.completed === false);

  if (!currentRoundData && rounds.length > 0) {
    currentRoundData = rounds[rounds.length - 1]
  }

  const currentRound = rounds.length;
  const matchesInCurrentRound = matches.filter(m => m?.round === currentRound && m?.isBye === false);

  const matchesToComplete = matchesInCurrentRound.filter(m => m?.completed === false && m?.isBye === false)
  const matchesPending = matchesToComplete.length

  const currentRoundWinners = currentRoundData?.winners

  const roundProgress = Math.round(100 - ((matchesPending / matchesInCurrentRound.length) * 100));

  const roundStartDate = dayjs(currentRoundData?.startDate).format('DD/MM/YYYY');
  const roundEndDate = dayjs(currentRoundData?.endDate).valueOf()

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
        <RoundCard
          currentRound={currentRound}
          matchesPending={matchesPending}
          roundProgress={roundProgress}
          matchesInCurrentRound={matchesInCurrentRound}
        />

        {/* CARD 2 - ROUND DATES */}
        <RoundDates 
            roundStartDate={roundStartDate}
            roundEndDate={roundEndDate}
            roundId = {currentRoundData?._id}
        />       

        {/* CARD 3 - CURRENT ROUND WINNERS */}
        <RoundWinnersCards 
          currentRoundWinners={currentRoundWinners}
          matchesToComplete={matchesToComplete}
        />

      </Row>
    </div>
  );
};

export default Dashboard;

import { Row, Col } from "antd";
import Loading from "../components/Loading";
import MatchCard from "../components/MatchCard";
import { useMatches } from "../context/MatchesContext";


const CurrentMatches = () => {

  const {matches, loading} = useMatches();

  const filteredMatches = matches.filter(m => !m.isBye)

  const maxRound = Math.max(...filteredMatches.map(m => m.round)); 

  if(loading) return <Loading />

  return (
   <Row gutter={[16, 16]} >       
          {filteredMatches.filter(m => m.round === maxRound).map((m) => (
            <Col xs={24} md={12} lg={8} key={m._id}>
              <MatchCard match={m} />
            </Col>
          ))}
   </Row>
  )
}

export default CurrentMatches
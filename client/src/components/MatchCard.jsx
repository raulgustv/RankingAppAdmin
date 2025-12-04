import { Typography, Row, Col, Card, InputNumber, Button } from "antd";
import { useEffect, useState } from "react";
import { saveMatchResults } from "../actions/matchResults";
import { validateTennisSets } from "../utils/setValidation";
import { toast } from 'react-toastify';
import Loading from "./Loading";
import { useMatches } from "../context/MatchesContext";
import {TrophyFilled} from "@ant-design/icons"


const { Text } = Typography;


const MatchCard = ({ match }) => {
  const p1Name = match.player1.name;
  const p1Lastname = match.player1.lastName;
  const p1Rank = match.player1.ranking;
  const p2Name = match.player2.name;
  const p2Lastname = match.player2.lastName;
  const p2Rank= match.player2.ranking;

  const {fetchMatches} = useMatches();

  const set_cols = ["Set 1", "Set 2", "Set 3"];
  

  const [sets, setSets] = useState([
    {player1Games: null, player2Games: null},
    {player1Games: null, player2Games: null},
    {player1Games: null, player2Games: null}    
  ]);  

  const [loading, setLoading] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false)
  const [winner, setWinner] = useState(null)

  //cargar estados matches
   useEffect(() =>{
    if(match.completed && match.sets?.length > 0){
        setSets(match.sets)
        setIsCompleted(true)
        setWinner(match.winner.name)
    }
  }, [match])

 
  //manejo estados
  const updateSetValue = (setIndex, player, value) =>{
    const updated  = [...sets];
    updated[setIndex][player] = value;
    setSets(updated);
  }

  //boton handlesave
  const handleSave = async() =>{

    const errorMessage  = validateTennisSets(sets)
    if(errorMessage){
        setLoading(true)
        toast.error(errorMessage)
        return setLoading(false)
    }

    const filteredSets = sets.filter(
            s => s.player1Games !== null && s.player2Games !== null
    );
        try {
            setLoading(true)
            const {data} = await saveMatchResults(match._id, filteredSets)
            toast.success(`Results have been saved correctly. Winner: ${data.winner}`)
            await fetchMatches()
            setIsCompleted(true)
        } catch (error) {
            console.log(error)
            toast.error('Error guardando la partida')
        } finally {
            setLoading(false)
        }
  }

  return (
    <Card
      style={{
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        height: "100%",         
        minHeight: 420,        
        display: "flex",        
        flexDirection: "column",
        justifyContent: "space-between",
      }}
      title={
        winner ? (
            <span>
                Round {match?.round} · <TrophyFilled style={{color: "gold"}} /> Winner: {winner} 
            </span>
        ) :
        (
            `Round: ${match.round}`
        )
      }
      
    >
      {/* MAIN CONTENT */}
      <div style={{ flex: 1 }}>
        
        {/* PLAYER NAMES */}
        <Row justify="space-between" align="middle" style={{ marginBottom: 25 }}>
          <Col span={10}>
            <Text strong style={{ fontSize: 16 }}>
              {p1Name} {p1Lastname} <small>({p1Rank})</small>
            </Text>
          </Col>

          <Col span={4} style={{ textAlign: "center" }}>
            <Text strong style={{ fontSize: 16 }}>vs</Text>
          </Col>

          <Col span={10} style={{ textAlign: "right" }}>
            <Text strong style={{ fontSize: 16 }}>
              {p2Name} {p2Lastname} <small>({p2Rank})</small>
            </Text>
          </Col>
        </Row>

        {/* SET HEADERS */}
        <Row
          style={{
            borderBottom: "1px solid #eaeaea",
            paddingBottom: 10,
            marginBottom: 10,
          }}
        >
          <Col span={8}>
            <Text strong>Player</Text>
          </Col>

          {set_cols.map((header, index) => (
            <Col span={5} key={`header-${index}`}>
              <Text strong>{header}</Text>
            </Col>
          ))}
        </Row>

        {/* PLAYER 1 */}
        <Row style={{ marginBottom: 12 }}>
          <Col span={8}>
            <Text>{p1Name}</Text>
          </Col>

          {sets.map((set, i) => (
            <Col span={5} key={`p1-set-${i}`}>
              <InputNumber
                min={0}
                max={7}
                style={{
                  width: "90%",
                  padding: "6px 4px",
                  borderRadius: 6,
                }}
                placeholder="0"
                onChange={(value) => 
                    updateSetValue(i, "player1Games", value)
                }
                value={set.player1Games}
                disabled={isCompleted}
              />
            </Col>
          ))}
        </Row>

        {/* PLAYER 2 */}
        <Row style={{ marginBottom: 20 }}>
          <Col span={8}>
            <Text>{p2Name}</Text>
          </Col>

          {sets.map((set, i) => (
            <Col span={5} key={`p2-set-${i}`}>
              <InputNumber
                min={0}
                max={7}
                style={{
                  width: "90%",
                  padding: "6px 4px",
                  borderRadius: 6,
                }}
                placeholder="0"
                onChange={(value) => 
                    updateSetValue(i, "player2Games", value)
                }
                value={set.player2Games}
                disabled={isCompleted}
              />
              
            </Col>
          ))}
        </Row>
      </div>

      {/* BUTTON */}
      <Row justify="center">
        {
            loading ? (
                <Loading />
            ) :
            <Button type="primary" size="large" onClick={handleSave} disabled={isCompleted}>
                Save result
            </Button>
        }
      </Row>
    </Card>
  );
};

export default MatchCard;

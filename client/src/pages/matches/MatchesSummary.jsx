import { Segmented, Table, Tag } from "antd"
import { useMatches } from "../../context/MatchesContext"
import { useEffect, useMemo, useState } from "react";
import MatchMiniCard from "../../components/MatchMiniCard";


const MatchesSummary = () => {


  const {matches} = useMatches();

  const rounds = useMemo(() =>{
    const unique = [...new Set(matches.map(m => m.round))];
    return unique.sort((a, b) => a-b)
  }, [matches])

  // console.log(matches)

  const [selectedRound, setselectedRound] = useState()

  const filteredMatches = matches.filter(m => m.round === selectedRound)

  //set default rounds
  useEffect(()=>{
      if(rounds?.length > 0){
        setselectedRound(rounds[rounds.length-1])
      }
  }, [rounds]);

  //columnas tabla
  const cols = [
    {
      title: 'Player 1',
      key: 'player1',
      render: (r) => `${r.player1.name} ${r.player1.lastName} `
    },
      {
      title: 'Player 1 Rank',
      key: 'player1Rank',
      render: (r) => `${r.player1.ranking}`
    },
    {
      title: 'Player 2',
      key: 'player2',
      render: (r) => r.isBye ? (
        <Tag color='geekblue'>Is Bye</Tag>
      ) : `${r.player2.name} ${r.player2.lastName} `
    },
   {
      title: 'Player 2 Rank',
      key: 'player2Rank',
      render: (r) => r.isBye ? (
        <Tag color='geekblue'>Is Bye</Tag>
      ) : `${r.player2.ranking}`
    },
    {
      title: 'Winner',
      key: 'winner',
      render: (r) => {
        if(r.isBye){
          return <Tag color='geekblue'>Is Bye</Tag>
        }
        if(!r.winner){
          return <Tag color='orange'>Pending match</Tag>
        }

        return `${r.winner.name} ${r.winner.lastName}`
          
      }
    },
    {
      title: 'Score',
      key: 'score',
      render: (r) => {
        if(r.isBye){
          return <Tag color='geekblue'>Is Bye</Tag>
        }
        if(!r.winner){
          return <Tag color='orange'>Pending match</Tag>
        }

        return (
          <MatchMiniCard record={r} />
        )
          
      }
    },
    
    
  ]



  return (
    <>

      <Segmented 
        value={selectedRound}
        onChange={setselectedRound}
        options={rounds}
        size="large"
      />

      
      <Table 
          dataSource={filteredMatches}
          columns={cols}
          rowKey="_id"
      />
    </>
  )
}

export default MatchesSummary

import { Button, Table } from "antd"
import { useMatches } from "../../context/MatchesContext"
import { exportToExcel } from "../../actions/exportExcel";


const MatchSummary = () => {

    const {matches} = useMatches()
    
    const roundMatches = matches.filter(m => m.completed === false)
    
    const cols = [
        {
            title: "Match",
            key: "match",
            render: (_, r, index) => index + 1
        },
        {
            title: "Player 1",
            key: "player1",
            render: (r) => `${r?.player1.name} ${r?.player1.lastName}`
        },
        {
            title: "Player 1 Rank",
            key: "ranking",
            render: (r) => r?.player1.ranking
        },
        {
            title: "Player 1 Contact #",
            key: "contactNumber",
            render: (r) => r?.player1.contactNumber
        },
         {
            title: "Player 2",
            key: "player2",
            render: (r) => `${r?.player2.name} ${r?.player2.lastName}`
        },
        {
            title: "Player 2 Rank",
            key: "ranking",
            render: (r) => r?.player2.ranking
        },
        {
            title: "Player 2 Contact #",
            key: "contactNumber",
            render: (r) => r?.player2.contactNumber
        }
    ];


  return (
    <div>
      <Table
        dataSource={roundMatches}
        columns={cols}
        rowKey="_id"
      />

      <Button
        variant="solid"
        color="cyan"
        onClick={() => exportToExcel(roundMatches)}
      >
        Export to excel
      </Button>
    </div>  
  )
}

export default MatchSummary

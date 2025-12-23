import { Tag, Tooltip } from "antd";
import { CheckCircleOutlined } from "@ant-design/icons";

const MatchMiniCard = ({ record }) => {

  const { player1, player2, sets, winner } = record;

  

  

  // Convert sets array -> "6-4 / 3-6 / 7-5"
  const scoreText =
    sets && sets?.length > 0
      ? sets.map(s => `${s?.player1Games}-${s?.player2Games}`).join(" / ")
      : "—";



  return (
    <div
      style={{
        display: "inline-flex",
        gap: 10,
        alignItems: "center",
        background: "#f5f5f5",
        padding: "8px 14px",
        borderRadius: 20,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      {/* PLAYER 1 */}
      <Tooltip title="Player 1">
        <Tag color={winner.name === player1.name ? "green-inverse" : "red-inverse"} style={{ borderRadius: 12 }}>
          {player1.name}
        </Tag>
      </Tooltip>

      {/* SCORES */}
      <div
        style={{
          display: "flex",
          gap: 6,
          fontSize: 14,
          fontWeight: 600,
        }}
      >
        <span>{scoreText}</span>
      </div>

      {/* PLAYER 2 */}
      <Tooltip title="Player 2">
        <Tag color={winner.name === player2.name ? "green-inverse" : "red-inverse"}style={{ borderRadius: 12 }}>
          {player2.name}
        </Tag>
      </Tooltip>

      {/* WINNER ICON */}
      <CheckCircleOutlined
        style={{ color: "#52c41a", fontSize: 18, marginLeft: 4 }}
      />
    </div>
  );
};

export default MatchMiniCard;

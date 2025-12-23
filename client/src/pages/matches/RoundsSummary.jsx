import { useRounds } from "../../context/RoundContext"
import {Flex, Table, Tag} from 'antd'
import dayjs from "dayjs";

const RoundsSummary = () => {

  const {rounds} = useRounds();

  console.log(rounds)

  const cols = [
    {
      title: 'Round #',
      key: 'roundNumber',
      render: (r) => r.roundNumber
    },
    {
      title: 'Completed',
      key: 'completed',
      render: (r) => r.completed === true ? 'Yes' : 'No'
    },
    {
      title: `Matches played (includes "bye")`,
      key: 'totalMatches',
      render: (r) => r.totalMatches
    },
    Table.EXPAND_COLUMN,
    {
      title: 'Winners',
      key: 'winners',
      render: (_text, r) => r.winners.length,
    },
    {
      title: 'Start date',
      key: 'startDate',
      render: (r) => dayjs(r?.startDate).format('DD/MM/YYYY')
    },
    {
      title: 'End date',
      key: 'endDate',
      render: (r) => dayjs(r?.endDate).format('DD/MM/YYYY')
    },
    
  ];

  const expandableConfig = {
    expandedRowRender: (exp, idx) => (
      <Flex gap="small" justify="end" wrap>
        {exp.winners.map((w) =>(
          <Tag color="green-inverse" key={`${idx}-${w.name}-${w.lastName}`}>
            {w.name} {w.lastName}
          </Tag>
        ))}
      </Flex>
    )
  }

  return (
    <>
        <Table
            dataSource={rounds}
            rowKey='_id'
            columns={cols}
            expandable={expandableConfig}
        />
    </>
  )
}

export default RoundsSummary

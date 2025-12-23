
import { Table } from 'antd'
import { usePlayers } from '../../context/PlayerContext';
import PenaltyModal from '../../components/PenaltyModal';
import ViewPenalty from './ViewPenalty';
import SuspendPlayer from '../../components/SuspendPlayer';

const AddPenalty = () => {

    const { players, fetchPlayers } = usePlayers();

    const activePlayers = players.filter(p => p.active === true);

    const columns = [
        {
            title: 'Name',
            key: 'name',
            sorter: {
                compare: (a, b) => a.lastName.localeCompare(b.lastName),
                multiple: 2
            },
            render: (record) => `${record.name} ${record.lastName}`,
            filters: players.map((p) => ({
                text: `${p.name} ${p.lastName}`,
                value: `${p.name} ${p.lastName}`
            })),
            filterSearch: true,
            onFilter: (value, record) => {
                const fullName = `${record.name} ${record.lastName}`.toLowerCase();
                return fullName.startsWith(value.toLowerCase());
            }
        },
        {
            title: 'Ranking #',
            key: 'ranking',
            sorter: {
                compare: (a, b) => (a.ranking ?? 0) - (b.ranking ?? 0),
                multiple: 1
            },
            render: (record) =>
                record.ranking === null ? '-' : record.ranking
        },
        {
            title: 'Email',
            key: 'email',
            render: (record) => record.email
        },
        {
            title: "Add penalty",
            key: 'addPenalty',
            render: (record) => (
                <div style={{ display: 'flex', gap: 8 }}>
                    <PenaltyModal
                        idPlayer={record?._id}
                        playerName={record?.name}
                        playerLastname={record?.lastName}
                    />
                    <SuspendPlayer
                        idPlayer={record?._id}
                        playerName={record?.name}
                        playerLastname={record?.lastName}
                        fetchPlayers={fetchPlayers}
                    />
                    <ViewPenalty
                        idPlayer={record?._id}
                    />
                </div>

            )
        }
    ];

    return (
        <Table
            dataSource={activePlayers}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
        />
    );
};


export default AddPenalty

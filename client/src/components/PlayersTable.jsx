import { Popconfirm, Switch, Table, Tooltip } from 'antd'
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons"
import { useState } from 'react'
import { activatePlayer, deactivatePlayer } from '../actions/getPlayers'
import { toast } from 'react-toastify'
import { usePlayers } from '../context/PlayerContext'

const PlayersTable = () => {

    const {players, fetchPlayers} = usePlayers()
    const [internalLevel, setInternalLevel] = useState(false);

    const toggleLevel = async() => {
        setInternalLevel(prev => !prev);
        await fetchPlayers()
    };

 
    const toggleStatus = async (id, checked) => {
        try {
            let data;
            if (checked) {
                data = await activatePlayer(id);
            } else {
                data = await deactivatePlayer(id);
            }

            if (data) toast.success(`Player ${data.message}`);
            await fetchPlayers()    

        } catch (error) {
            toast.error("Error updating player status");
        }
    };

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
            title: 'Contact #',
            key: 'contactNumber',
            render: (record) => record.contactNumber
        },
        {
            title: (
                <div style={{ display: 'flex', alignItems: 'center', gap: "8px" }}>
                    <Tooltip title='Click to toggle between NTRP and internal level'>
                        <span>{internalLevel ? 'Internal level' : 'NTRP Level'}</span>
                    </Tooltip>
                    <Switch
                        checkedChildren='View NTRP Lv'
                        unCheckedChildren='View Internal Level'
                        onChange={toggleLevel}
                        size='small'
                    />
                </div>
            ),
            key: 'internalLevel',
            sorter: {
                compare: (a, b) =>
                    internalLevel
                        ? a.internalLevel - b.internalLevel
                        : a.utrLevel - b.utrLevel,
                multiple: 3
            },
            render: (_, record) => (
                internalLevel
                    ? <span>{Number(record.internalLevel).toFixed(2)}</span>
                    : <span>{Number(record.utrLevel)}</span>
            )
        },
        {
            title: 'Joined round #',
            key: 'joinedRound',
            render: (record) => record.joinedRound
        },
        {
            title: 'Status',
            key: 'active',
            render: (_, record) => (
                <Popconfirm
                    title={
                        record.active
                            ? 'Deactivating a player will result in losing rank position. Proceed?'
                            : 'Reactivating a player will place him last in ranking. Proceed?'
                    }
                    okText="Yes"
                    cancelText="No"
                    onConfirm={() => toggleStatus(record._id, !record.active)}
                >
                    <div
                        onClick={(e) => e.preventDefault()}
                        style={{ display: 'inline-block' }}
                    >
                        <Switch
                            checked={record.active}
                            checkedChildren='Active'
                            unCheckedChildren='Inactive'
                        />
                    </div>
                </Popconfirm>
            )
        }
    ];

    const adjustCols = [
        {
            title: "Change",
            dataIndex: 'change',
            key: 'change',
            render: (c) => {
                const v = Math.abs(Number(c)).toFixed(2);

                if (Number(c) > 0) {
                    return (
                        <span style={{ color: 'green', fontWeight: 600 }}>
                            <ArrowUpOutlined /> {v}
                        </span>
                    );
                } else {
                    return (
                        <span style={{ color: 'red', fontWeight: 600 }}>
                            <ArrowDownOutlined /> {v}
                        </span>
                    );
                }
            }
        },
        {
            title: 'Result',
            dataIndex: 'reason',
            key: 'reason'
        },
        {
            title: (
                <Tooltip title='Corresponds to the rank # when the match was played'>
                    <span>Rank</span>
                </Tooltip>
            ),
            dataIndex: 'currentRank',
            key: 'currentRank'
        }
    ];

    const expandableConfig = {
        expandedRowRender: (player) => (
            <Table
                dataSource={player.adjustmentHistory}
                columns={adjustCols}
                pagination={false}
                rowKey="_id"
                size="small"
            />
        ),
        rowExpandable: (player) =>
            Array.isArray(player.adjustmentHistory) &&
            player.adjustmentHistory.length > 0
    };

    return (
        <Table
            dataSource={players}
            columns={columns}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            expandable={expandableConfig}
        />
    );
};

export default PlayersTable;

import { Row, Card, Col, Divider, Statistic, Button, DatePicker,  } from 'antd'
import { CalendarOutlined, ClockCircleOutlined, EditOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useState } from 'react';
import { updateRound } from '../actions/round';
import { toast } from 'react-toastify';
import { useRounds } from '../context/RoundContext';

const RoundDates = ({ roundStartDate, roundEndDate, roundId }) => {

    const { Timer } = Statistic;

    const {fetchRounds} = useRounds()

    const [editingEndDate, setEditingEndDate] = useState(false)
    const [tempEndDate, setTempEndDate] = useState(null)
    


    const handleUpdateEndDate = () =>{

        if(!tempEndDate) return;

        updateRound(dayjs(tempEndDate).toDate(), roundId).then((data) =>{
            setEditingEndDate(false);
            setTempEndDate(null);
            fetchRounds()
            toast.success(`Round ${data.roundNumber} end date updated to ${dayjs(data.endDate).toDate()}`)
        }).catch(err => {
            console.log(err)
            toast.error('Internal error', err)
        })
    }

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
        <>
            <Col xs={24} sm={12} md={16}>
                <Card hoverable style={cardStyle} >

                    <Row justify="space-between" align="middle">
                        <Col span={12}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <CalendarOutlined style={{ fontSize: 32, color: "grey" }} />
                                <span style={{ fontSize: 13 }}>Round start date</span>
                                <span style={{ fontSize: 20, fontWeight: "bold" }}>{roundStartDate}</span>
                            </div>
                        </Col>

                        <Col span={12}>
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    gap: 4,
                                }}
                            >
                                <CalendarOutlined style={{ fontSize: 32, color: "grey" }} />
                                <span style={{ fontSize: 13 }}>Round end date</span>

                                {/* INLINE EDIT */}
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {!editingEndDate ? (
                                        <>
                                            <span style={{ fontSize: 20, fontWeight: "bold" }}>
                                                {dayjs(roundEndDate).format("DD/MM/YYYY")}
                                            </span>

                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<EditOutlined />}
                                                onClick={() => {
                                                    setEditingEndDate(true);
                                                    setTempEndDate(dayjs(roundEndDate));
                                                }}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <DatePicker
                                                value={tempEndDate}
                                                onChange={setTempEndDate}
                                                size="small"
                                                disabledDate={(current) =>
                                                    current && current <= dayjs(roundEndDate)
                                                }
                                            />

                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<CheckOutlined />}
                                                onClick={() => {
                                                    if (!tempEndDate) return;                                                    
                                                    handleUpdateEndDate()
                                                    setEditingEndDate(false);
                                                }}
                                            />

                                            <Button
                                                type="text"
                                                size="small"
                                                icon={<CloseOutlined />}
                                                onClick={() => setEditingEndDate(false)}
                                            />
                                        </>
                                    )}
                                </div>
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
        </>
    )
}

export default RoundDates

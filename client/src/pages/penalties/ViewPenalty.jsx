import { Button, Typography, Modal, Card, Row, Col } from "antd";
import { useState } from "react";
import axiosInstance from "../../API/axios";
import dayjs from "dayjs";

const ViewPenalty = ({ idPlayer }) => {
  const { Title } = Typography;

  const [penaltyData, setPenaltyData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPenalty = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/penalty/penalties/${idPlayer}`
      );
      setPenaltyData(data || []);
    } catch (error) {
      console.log(error);
      setPenaltyData([]);
    } finally {
      setLoading(false);
    }
  };

  const showModal = () => {
    setIsModalOpen(true);
    if (idPlayer) fetchPenalty();
  };

  const handleCancelModal = () => {
    setIsModalOpen(false);
    setPenaltyData([]);
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        View penalty
      </Button>

      <Modal
        open={isModalOpen}
        confirmLoading={loading}
        title="Player penalties"
        onCancel={handleCancelModal}
        footer={null}
      >
        {loading && <Title level={5}>Loading penalties...</Title>}

        {!loading && penaltyData.length === 0 && (
          <Title level={5}>No penalties</Title>
        )}

        {!loading && penaltyData.length > 0 && (
          <Row gutter={[0, 16]}>
            {penaltyData.map((pd) => (
              <Col span={24} key={pd._id}>
                <Card
                  variant="borderless"
                  title={
                    <>
                        {pd.reason} 
                        <small style={{marginLeft: '3px'}}>{dayjs(pd?.createdAt).format("DD/MM/YYYY")}</small>
                    </>
                  }
                  style={{ background: "#f5f5f5" }}
                >
                  <Title level={5}>{pd.note}</Title>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    </>
  );
};

export default ViewPenalty;

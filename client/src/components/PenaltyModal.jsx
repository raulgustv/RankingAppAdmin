import { Button, Form, Modal, Select, Input } from 'antd';
import { PlusCircleOutlined } from "@ant-design/icons";
import { useState } from 'react';
import { addPlayerPenalty } from '../actions/getPlayers';
import { toast } from 'react-toastify';

const PenaltyModal = ({ idPlayer, playerName, playerLastname }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const showModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        form.resetFields();
        setIsModalOpen(false);
    };

    const onFinish = (values) => {
        const { reason, note } = values;

        addPlayerPenalty(idPlayer, reason, note).then(data => {
            toast.success('Penalty point added correctly')
        }).catch((err) => {
            toast.error('Error adding penalty point', err)
        }).finally(() => {
            closeModal();
        }
        )

    };

    const selectOptions = [
        { value: 'No Show', label: "No Show" },
        { value: 'Late cancellations', label: "Late cancellations" },
        { value: 'Rejects challenges', label: "Rejects challenges" },
        { value: 'Unsportsmanship conduct', label: "Unsportsmanship conduct" },
        { value: 'Cheating', label: "Cheating" },
        { value: 'No result reporting', label: "No result reporting" },
    ];

    return (
        <>
            <Button
                icon={<PlusCircleOutlined />}
                type="primary"
                onClick={showModal}
            />

            <Modal
                title={`Add penalty to ${playerName} ${playerLastname}`}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                okText="Add penalty"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="reason"
                        label="Penalty reason"
                        rules={[
                            { required: true, message: "Please select a valid reason" }
                        ]}
                    >
                        <Select
                            options={selectOptions}
                            placeholder="Select a reason"
                        />
                    </Form.Item>

                    <Form.Item
                        name="note"
                        label="Note"
                        rules={[
                            { required: true, message: "Note details are required" }
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Add note"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default PenaltyModal;

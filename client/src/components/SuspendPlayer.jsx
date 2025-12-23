import { Button, Form, Modal, Input } from 'antd';
import { useState } from 'react';
import { addSuspension } from '../actions/getPlayers';
import { toast } from 'react-toastify';

const SuspendPlayer = ({ idPlayer, playerName, playerLastname, fetchPlayers }) => {

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
        const { suspension } = values;

        addSuspension(idPlayer, suspension).then((data) => {
            const {player} = data;
            toast.success(`${player.name} ${player.lastName} has been suspended`)
        }).catch((err) => {
            toast.error('Error adding suspnesión', err)
        }).finally(() => {
            closeModal();
            fetchPlayers()
        }
        )

    };

    return (
        <>
            <Button                
                onClick={showModal}
                color='danger'
                variant='solid'
            >
                Suspend player
            </Button>

            <Modal
                title={`Adding suspension to ${playerName} ${playerLastname}`}
                open={isModalOpen}
                onCancel={closeModal}
                onOk={() => form.submit()}
                okText="Suspend player"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                >
                    <Form.Item
                        name="suspension"
                        label="Suspension Message"
                        rules={[
                            { required: true, message: "Suspension message is required" }
                        ]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="Add suspension details"
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default SuspendPlayer;

import { Form, Button, Input, InputNumber, Select, Slider } from "antd";
import { useState } from "react";
import { newPlayer } from "../../actions/newPlayer";
import { toast } from 'react-toastify';
import Loading from "../../components/Loading";


const layout = {
  labelCol: { span: 8 },
  wrapperCol: { span: 16 }
};


const PlayerForm = () => {

  const [loading, setLoading] = useState(null)

  const [form] = Form.useForm();

  const onFinish = async (values) => {

    setLoading(true)

    const { ok, data } = await newPlayer(values)

    if (!ok) {
      setLoading(false)
      return;
    }

    setLoading(false)
    toast.success(`${data?.player?.name} has been added to the ranking`)
    form.resetFields();
  }

  return (
    <Form
      {...layout}
      name="player-form"
      form={form}
      initialValues={{ utrLevel: 2.0 }}
      onFinish={onFinish}
      style={{ maxWidth: 600 }}
    >
      <Form.Item name="name" label="Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="lastName" label="Last Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="email" label="Email" rules={[{ type: "email", required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="age" label="Age" rules={[{ type: "number", min: 18, max: 79, required: true }]}>
        <InputNumber />
      </Form.Item>

      <Form.Item name="gender" label="Gender" rules={[{ required: true }]}>
        <Select options={[{ value: "M", label: "M" }, { value: "F", label: "F" }]} />
      </Form.Item>

      <Form.Item name="contactNumber" label="Contact Number" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item
        name="utrLevel"
        label="NTRP Level"
        rules={[{ required: true }]}
        valuePropName="value"
        tooltip={'Max NTRP allowed is 5'}
      >
        <Slider
          min={2.0}
          max={5.0}
          step={0.5}
          tooltip={{ formatter: (val) => `${val}` }}
          marks={{
            2.0: "2.0",
            2.5: "2.5",
            3.0: "3.0",
            3.5: "3.5",
            4.0: "4.0",
            4.5: "4.5",
            5.0: "5.0",
          }}
        />
      </Form.Item>

      <div style={{ marginTop: 4 }}>
        <a href="https://germanmillstennisclub.com/ntrp-chart/" target="_blank" rel="noopener noreferrer" style={{ fontSize: 12 }}>
          Ver información NTRP
        </a>
      </div>

      <Form.Item wrapperCol={{ ...layout.wrapperCol, offset: 8 }}>
        {
          loading ? <Loading /> :
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
        }
      </Form.Item>
    </Form>
  );
}

export default PlayerForm;

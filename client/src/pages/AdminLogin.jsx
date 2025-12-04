import {useContext, useState} from 'react';
import { Card, Form, Input, Button, Typography } from "antd";
//import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../actions/login';
import Loading from '../components/Loading';
import { AdminAuthContext } from '../context/AdminAuthContext';
import { toast } from 'react-toastify';



const {Title} = Typography;

const AdminLogin = () => {

    const navigate = useNavigate();
    const {login} = useContext(AdminAuthContext)
    const [loading, setloading] = useState(null)
    

    const onFinish = async(values) =>{

        setloading(true)
      
        const {ok, token, admin} = await adminLogin(values);

        if(!ok){
          setloading(false)
          return;
        }

        login(token, admin)   

        toast.success(`Bienvenido/a ${admin?.name}`)

        navigate('/admin/dashboard')
    }

    const onFinishFailed = (error) =>{
        console.log(error)
        
    }   

  return (
     <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f5f5f5",
      }}
    >
      <Card style={{ width: 450, padding: 20, borderRadius: 12 }}>
        <Title level={3} style={{ textAlign: "center", marginBottom: 30 }}>
          Admin Login
        </Title>

        <Form
          name="admin-login-form"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 400, margin: "0 auto" }}
          initialValues={{ remember: true }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: "Por favor ingresar un email!" }]}
          >
            <Input placeholder="admin@admin.com" />
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{ required: true, message: "Por favor ingrese una contraseña" }]}
          >
            <Input.Password />
          </Form.Item>

          <Form.Item label={null} style={{ textAlign: "center" }}>
            {
              loading ? <Loading /> : (
                <Button
                  type="primary"
                  htmlType="submit"
                  style={{ width: "100%" }}
                >
                  Login
                </Button>)
            } 
            
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default AdminLogin
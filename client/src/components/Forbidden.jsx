import {Button, Result} from 'antd'
import { useNavigate } from 'react-router-dom'


const Forbidden = () => {

    const navigate = useNavigate()    

  return (
    <Result 
        status="403"
        title="403"
        subTitle="Sorry you are not authorized to view this page"
        extra={<Button type='primary' onClick={() => navigate('/admin/login')}>Back home</Button>}
    />
  )
}

export default Forbidden
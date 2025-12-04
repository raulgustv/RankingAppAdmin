import {Flex, Spin} from 'antd'

const Loading = () => {
  return (
    <div>
        <Flex align='center' gap='middle'>
            <Spin size='default'>
                <Spin />
            </Spin>
        </Flex>
    </div>
  )
}

export default Loading
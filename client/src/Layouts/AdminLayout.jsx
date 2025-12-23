import { useContext } from 'react';
import {Layout, Menu, Breadcrumb, theme} from 'antd'
import {Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  UserOutlined,
  LogoutOutlined,
  FlagOutlined,
  DislikeOutlined
} from "@ant-design/icons";
import Sider from 'antd/es/layout/Sider';
import { Content } from 'antd/es/layout/layout';
import { AdminAuthContext } from '../context/AdminAuthContext';
import Loading from '../components/Loading';

const {Header} = Layout;

const topMenu = [
  { key: "1", label: "Main dashboard" },
  { key: "2", label: "Generate rounds" },
  { key: "3", label: "Current matches" },
];

  
const AdminLayout = () => {

const {admin, loading} = useContext(AdminAuthContext);

const navigate = useNavigate();
const location = useLocation();

const sideMenu = [
      {
          key: 'players',
          icon: <UserOutlined />,
          label: "Players",
          children: [
            {
                key: "create-player",
                label: "Create player",
                onClick: () => navigate('/admin/create-player')
            },
            {
                key: "view-players",
                label: "Manage Players",
                onClick: () => navigate('/admin/view-players')
            }
          ]
      },
      {
          key: 'matches',
          icon: <FlagOutlined />,
          label: "Matches",
          children: [
            {
                key: "matchSummary",
                label: "Export round matches",
                onClick: () => navigate('/admin/match-round-export')
            },
            {
                key: "allRounds",
                label: "All rounds summary",
                onClick: () => navigate('/admin/all-rounds')
            },
            {
                key: "allMatchesSummry",
                label: "All matches summary",
                onClick: () => navigate('/admin/all-matches')
            }
          ]
      },
       {
          key: 'penalties',
          icon: <DislikeOutlined />,
          label: "Penalties",
          children: [
            {
                key: "penaltyPoint",
                label: "Add Penalty",
                onClick: () => navigate('/admin/penalty')
            },
            {
                key: "suspension",
                label: "Suspended players",
                onClick: () => navigate('/admin/suspensions')
            }
          ]
      },
  ];

  const breadCrumbItems = location.pathname.split("/")
                            .filter(Boolean)
                            .map((segment) =>({
                                title: segment.charAt(0).toUpperCase() + segment.slice(1).replace("-", " ")
                            }));

const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const {logout} = useContext(AdminAuthContext);


const handleTopMenu = ({key}) =>{
    if(key === "1") navigate("/admin/dashboard")
    if(key === "2") navigate("/admin/rounds")
    if(key === "3") navigate("/admin/current-matches")
}

return (
        <Layout style={{minHeight: "100vh"}}>
            <Header 
                style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "0 20px"
                }}
            >
                <div
                    style={{
                        color: "white",
                        fontWeight: "bold",
                        fontSize: 18,
            
                    }}
                >
                    Madrid Tennis Ranking 2025
                </div>                

                <Menu
                    theme='dark'
                    mode='horizontal'
                    defaultSelectedKeys={["1"]}
                    items={topMenu}
                    onClick={handleTopMenu}
                    style={{flex: 1, minWidth: 0}}
                />

                {
                    loading ? <Loading /> :
                    <span style={{ color: "white", marginLeft: 20 }}>
                        Hola, {admin?.name}
                    </span>
                }

                {/* LOGOUT  */}
                <LogoutOutlined 
                    style={{
                        color: "white",
                        fontSize: 20,
                        cursor: "pointer",
                        marginLeft: 20
                    }}
                    title='Cerrar sesión'
                    onClick={() =>{
                        logout();
                        navigate('/admin/login')
                    }}
                />

            </Header>

            {/* Contenedor principal */}
            <Layout>
                {/* SIDEBAR */}
                <Sider 
                    width={220} 
                    style={{
                        background: colorBgContainer, 
                        borderRight: "4px solid #eaeaea"
                    }}                
                >
                    <Menu 
                        mode='inline'
                        defaultSelectedKeys={["1"]}
                        defaultOpenKeys={["sub1"]}
                        style={{height: "100%", borderInlineEnd: 0}}
                        items={sideMenu}
                    />                 
                    
                </Sider>     
                

                {/* CONTENT */}
                <Layout style={{padding: "0"}}>
                    <div style={{paddingLeft: 16, margin: "20px 0 24px 0" }}>
                        <Breadcrumb 
                            items={breadCrumbItems}
                        />
                    </div>
                      <Content
                    style={{
                        padding: 24,
                        margin: 0,
                        minHeight: 360,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
                </Layout>              
            </Layout>
        </Layout>
  )
}

export default AdminLayout
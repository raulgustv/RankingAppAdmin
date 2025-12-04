import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '../Layouts/AdminLayout'
import AdminLogin from '../pages/AdminLogin'
import ProtectedAdminRoute from './ProtectedAdminRoute'
import Forbidden from '../components/Forbidden'
import Dashboard from '../pages/Dashboard'
import PublicAdminRoute from './PublicAdminRoute'
import CreatePlayer from '../pages//players/CreatePlayer'
import Rounds from '../pages/Rounds'
import CurrentMatches from '../pages/CurrentMatches'
import ViewPlayers from '../pages/players/ViewPlayers'
import MatchSummary from '../pages/matches/MatchSummary'
import MatchesSummary from '../pages/matches/MatchesSummary'
import RoundsSummary from '../pages/matches/RoundsSummary'

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN PUBLICO */}
           <Route 
            path="/admin/login"
            element={
              <PublicAdminRoute>
                <AdminLogin />
              </PublicAdminRoute>
            }
          />

          {/* <Route path="/admin/login" element={<AdminLogin />} /> */}


        {/* ADMIN AREA */}
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute>
              <AdminLayout />
            </ProtectedAdminRoute>
          }
        >
          {/* ESTA ES TU RUTA /admin/dashboard */}
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="rounds" element={<Rounds />} />
          <Route path="create-player" element={<CreatePlayer />} />
          <Route path="view-players" element={<ViewPlayers />} />
          <Route path="current-matches" element={<CurrentMatches />} />
          <Route path="match-round-export" element={<MatchSummary />} />
          <Route path="all-matches" element={<MatchesSummary />} />
          <Route path="all-rounds" element={<RoundsSummary />} />
        </Route>

        {/* FORBIDDEN */}
        <Route path="/forbidden" element={<Forbidden />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/admin/login" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter

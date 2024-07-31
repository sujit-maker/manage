
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Adpage from './components/Admin/Adpage';
import AdminDashboard from './components/Admin/AdminDashboard';
import EnDashboard from './components/Engineer/EnggDash';
import LoginPage from './components/LoginPage';
import ServicesDashboard from './components/Admin/ServicesDashboard';
import CustomerPage from './components/Admin/CustomerPage';
import SitesPage from './components/Admin/SitesPage';
import TaskDashboard from './components/Admin/TaskDashboard';
import SalesDashboard from './components/Sales/SalesDashboard';
import ManagerDashboard from './components/Manager/ManagerDashboard';
import Reccuring from './components/Admin/Reccuring';
import Amc from './components/Admin/Amc';

const app = () => {
  return (
    <Router>
      <div>
        <Routes>
          <Route path='/' element={<LoginPage/>}/>
           
          <Route path='/dashboard' element={<Adpage/>}/>
          <Route path='/admin' element={<AdminDashboard/>}/>
          <Route path='/services' element={<ServicesDashboard/>} />
          <Route path='/customers' element={<CustomerPage/>} />
          <Route path='/sites' element={<SitesPage/>} />
          <Route path='/tasks' element={<TaskDashboard/>} />
          <Route path='/recurring' element={<Reccuring/>} />
          <Route path='/amc' element={<Amc/>} />

          <Route path='/endash' element={<EnDashboard/>}/>

          <Route path='/sales' element={<SalesDashboard/>}/>

          <Route path='/manager' element={<ManagerDashboard/>}/>
        </Routes>
      </div>
    </Router>
  );
}

export default app;

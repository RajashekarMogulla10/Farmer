import React, { useEffect, useState } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import ScientistDashboard from './pages/ScientistDashboard';

function PrivateRoute({ component: Component, role, ...rest }) {
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  const sessionExpiry = localStorage.getItem('sessionExpiry');
  const isAuthenticated = userId && userRole === role && sessionExpiry && new Date().getTime() < parseInt(sessionExpiry);

  return (
    <Route
      {...rest}
      render={props =>
        isAuthenticated ? <Component {...props} /> : <Redirect to="/" />
      }
    />
  );
}

function App() {
  const [sessionActive, setSessionActive] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    const now = new Date().getTime();

    if (userId && sessionExpiry && now < parseInt(sessionExpiry)) {
      setSessionActive(true);
    } else if (sessionExpiry && now >= parseInt(sessionExpiry)) {
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('sessionExpiry');
      setSessionActive(false);
    }

    // Reset timeout on user activity
    const resetTimeout = () => {
      if (sessionActive) {
        const expiry = new Date().getTime() + 30 * 60 * 1000; // 30 minutes
        localStorage.setItem('sessionExpiry', expiry);
      }
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keypress', resetTimeout);

    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
    };
  }, [sessionActive]);

  return (
    <div className="App">
      <Switch>
        <Route exact path="/" component={Login} />
        <PrivateRoute path="/farmer" component={FarmerDashboard} role="farmer" />
        <PrivateRoute path="/scientist" component={ScientistDashboard} role="scientist" />
        <Route path="*" render={() => <Redirect to="/" />} />
      </Switch>
    </div>
  );
}

export default App;

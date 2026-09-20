import { Outlet } from 'react-router-dom';
import PublicNavbar from '../components/common/PublicNavbar';
import Footer from '../components/common/Footer';
import { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';

const PublicLayout = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    settingsAPI.getPublic()
      .then(({ data }) => setSettings(data.data))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet context={{ settings }} />
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default PublicLayout;

import React, { useState } from 'react';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import MainContent from './components/MainContent';
import QuotesView from './components/QuotesView';
import ClientsView from './components/ClientsView';
import MassSenderView from './components/MassSenderView';
import Chatbot from './components/Chatbot';
import { generateDateRangeReportPDF } from './services/pdfService';
import DateRangeModal from './components/DateRangeModal';
import { useAppContext } from './contexts/AppContext';

interface DashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const {
    leads,
    activeTab,
    setActiveTab,
    handleSelectLead,
    handleClassChange,
    clients,
    handleSelectClient,
    history,
    isLoadingNotion,
    isLeftSidebarOpen,
    setIsLeftSidebarOpen
  } = useAppContext();

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleGenerateReport = () => {
    setIsReportModalOpen(true);
  };

  const handleGenerateDateRangeReport = async (startDate: string, endDate: string) => {
    try {
      await generateDateRangeReportPDF(history, startDate, endDate);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const renderMainContent = () => {
    if (isLoadingNotion) {
      return (
        <div className="flex items-center justify-center h-full text-text-secondary">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mr-3" />
          Cargando datos...
        </div>
      );
    }

    switch (activeTab) {
      case 'ventas':
        return (
          <MainContent
            leads={leads}
            history={history}
            toggleSelectLead={handleSelectLead}
            onSyncToNotion={() => undefined}
            isSyncing={isLoadingNotion}
            onClassChange={handleClassChange}
            onGenerateDailyReport={handleGenerateReport}
          />
        );
      case 'clientes':
        return (
          <ClientsView
            clients={clients}
            history={history}
            toggleSelectClient={handleSelectClient}
            onSyncToNotion={() => undefined}
            isSyncing={isLoadingNotion}
            onClassChange={handleClassChange}
          />
        );
      case 'cotizaciones':
        return <QuotesView leads={leads} />;
      case 'masivos':
        return <MassSenderView />;
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLogout={onLogout}
        onToggleLeftSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
        onToggleRightSidebar={() => undefined}
      />

      <main className="flex-1 overflow-hidden relative bg-bg-primary w-full p-4 lg:p-6">{renderMainContent()}</main>

      <Chatbot />

      <DateRangeModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onGenerate={handleGenerateDateRangeReport}
      />
    </MainLayout>
  );
};

const App: React.FC = () => {
  const mockUser = { name: 'Usuario', email: 'admin@erp.com' };
  return <Dashboard user={mockUser} onLogout={() => console.log('Logout disabled')} />;
};

export default App;

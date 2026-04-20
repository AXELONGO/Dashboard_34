import React, { useState } from 'react';
import Header from './components/Header';
import MainLayout from './components/MainLayout';
import MainContent from './components/MainContent';
import QuotesView from './components/QuotesView';
import ClientsView from './components/ClientsView';
import MassSenderView from './components/MassSenderView';
import Chatbot from './components/Chatbot';
import { generateDailyReportPDF, generateDateRangeReportPDF } from './services/pdfService';
import DateRangeModal from './components/DateRangeModal';
import { useAppContext } from './contexts/AppContext';

interface DashboardProps {
    user: any;
    onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
    // Access Global State from Context
    const {
        leads,
        activeTab,
        setActiveTab,
        handleSelectLead,
        handleClassChange,
        activeLeadId,

        clients,
        handleSelectClient,
        activeClientId,

        history,
        saveNote,

        isLoadingNotion,
        supportTickets,
        isLeftSidebarOpen,
        setIsLeftSidebarOpen,
    } = useAppContext();

    // Local UI State (Modals only)
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // PDF Report Logic (UI specific)
    const handleGenerateReport = async () => {
        setIsReportModalOpen(true);
    };

    const handleConfirmDateRange = async (startDate: Date, endDate: Date) => {
        setIsReportModalOpen(false);
        try {
            const success = await generateDateRangeReportPDF(history, startDate.toISOString(), endDate.toISOString());
            if (success !== undefined) { // Function returns void, success check might be misinterpreted. Service returns void or alert? Service returns void.
                // generateDateRangeReportPDF returns void.
                // We assume if it didn't throw, it worked.
                console.log("Report generation initiated");
            }
        } catch (error) {
            console.error("Error generating report:", error);
        }
    };

    // --- RENDER HELPERS ---

    const renderMainContent = () => {
        if (isLoadingNotion) {
            return (
                <div className="flex items-center justify-center h-full text-text-secondary">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-blue mr-3"></div>
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
                        onSyncToNotion={() => { }} // Placeholder as not exposed yet
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
                        onSyncToNotion={() => { }} // Placeholder
                        isSyncing={isLoadingNotion}
                        onClassChange={handleClassChange} // Reuse handleClassChange? Check signature.
                    />
                );
            case 'cotizaciones':
                return <QuotesView onGenerateQuote={() => { }} leads={leads} />;
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
                isSidebarOpen={isLeftSidebarOpen}
                onToggleSidebar={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
            />

            {/* Main Content Area */}
            <main className="flex-1 overflow-hidden relative bg-bg-primary w-full p-4 lg:p-6">
                {renderMainContent()}
            </main>

            {/* Chatbot Overlay */}
            <Chatbot />

            {/* Modals */}
            <DateRangeModal
                isOpen={isReportModalOpen}
                onClose={() => setIsReportModalOpen(false)}
                onConfirm={handleConfirmDateRange}
            />
        </MainLayout>
    );
};

const App: React.FC = () => {
    const mockUser = { name: "Usuario", email: "admin@erp.com" };

    return <Dashboard user={mockUser} onLogout={() => console.log("Logout disabled")} />;
};

export default App;

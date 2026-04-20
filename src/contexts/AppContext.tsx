import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useLeadsManager } from '../hooks/useLeadsManager';
import { useClientsManager } from '../hooks/useClientsManager';
import { useHistoryManager } from '../hooks/useHistoryManager';
import { Lead, HistoryItem } from '../types';
import { useToast } from './ToastContext';
import {
    getLeadsFromNotion,
    getHistoryFromNotionDatabase,
    getClientsFromNotion,
    getClientsHistoryFromNotionDatabase,
    getSupportTicketsFromNotion,
    syncLeadToNotion,
    addHistoryToNotionDatabase,
    addClientHistoryToNotionDatabase
} from '../services/notionService';


interface AppContextType {
    // Leads
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    activeLeadId: string | null;
    setActiveLeadId: React.Dispatch<React.SetStateAction<string | null>>;
    handleSelectLead: (id: string) => void;
    handleClassChange: (id: string, newClass: string) => Promise<void>;

    // Clients
    clients: Lead[];
    setClients: React.Dispatch<React.SetStateAction<Lead[]>>;
    activeClientId: string | null;
    setActiveClientId: React.Dispatch<React.SetStateAction<string | null>>;
    handleSelectClient: (id: string) => void;

    // History
    history: HistoryItem[];
    setHistory: React.Dispatch<React.SetStateAction<HistoryItem[]>>;
    globalHistory: HistoryItem[];
    clientsHistory: HistoryItem[];
    saveNote: (text: string, agent: string, interactionType: string) => Promise<void>;

    // UI / Global
    activeTab: 'ventas' | 'cotizaciones' | 'clientes' | 'masivos';
    setActiveTab: React.Dispatch<React.SetStateAction<'ventas' | 'cotizaciones' | 'clientes' | 'masivos'>>;
    isLoadingNotion: boolean;
    supportTickets: any[];

    // Sidebar Control (shared)
    isLeftSidebarOpen: boolean;
    setIsLeftSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FALLBACK_LEADS: Lead[] = [];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const leadsManager = useLeadsManager();
    const clientsManager = useClientsManager();
    const historyManager = useHistoryManager();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState<'ventas' | 'cotizaciones' | 'clientes' | 'masivos'>('ventas');
    const [isLoadingNotion, setIsLoadingNotion] = useState(true);
    const [supportTickets, setSupportTickets] = useState<any[]>([]);
    const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(window.innerWidth >= 1024);

    // Initial Data Load
    useEffect(() => {
        const initData = async () => {
            setIsLoadingNotion(true);
            try {
                const [notionLeads, notionHistory, notionClients, notionClientsHistory, notionSupport] = await Promise.all([
                    getLeadsFromNotion(),
                    getHistoryFromNotionDatabase(),
                    getClientsFromNotion(),
                    getClientsHistoryFromNotionDatabase(),
                    getSupportTicketsFromNotion()
                ]);

                if (notionLeads.length > 0) leadsManager.setLeads(notionLeads);
                else leadsManager.setLeads(FALLBACK_LEADS);

                if (notionClients.length > 0) clientsManager.setClients(notionClients);
                if (notionSupport) setSupportTickets(notionSupport);

                // Enrich History
                const enrichedHistory = notionHistory.map(h => {
                    const client = notionLeads.find(l => l.id === h.clientId);
                    return {
                        ...h,
                        clientName: client ? client.name : (h.clientName || (h.clientId ? 'Cargando...' : 'Sin Asignar')),
                        clientWebsite: client ? client.website : undefined
                    };
                });

                historyManager.setGlobalHistory(enrichedHistory);
                historyManager.setHistory(enrichedHistory);
                historyManager.setClientsHistory(notionClientsHistory);

            } catch (error) {
                console.error("Critical Data Load Error:", error);
                leadsManager.setLeads(FALLBACK_LEADS);
                showToast("Error al cargar datos iniciales. Revisa la consola.", "error");
            } finally {
                setIsLoadingNotion(false);
            }
        };
        initData();
    }, []);

    // Tab Context Switching
    useEffect(() => {
        // Reset selections
        leadsManager.setActiveLeadId(null);
        leadsManager.setLeads(prev => prev.map(l => ({ ...l, isSelected: false })));
        clientsManager.setActiveClientId(null);
        clientsManager.setClients(prev => prev.map(c => ({ ...c, isSelected: false })));

        if (activeTab === 'clientes') {
            const enrichedClientsHistory = historyManager.clientsHistory.map(h => {
                const client = clientsManager.clients.find(c => c.id === h.clientId);
                return {
                    ...h,
                    clientName: client ? client.name : (h.clientName || 'Cliente'),
                    clientWebsite: client ? client.website : undefined
                };
            });
            historyManager.setHistory(enrichedClientsHistory.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
        } else if (activeTab === 'ventas') {
            historyManager.setHistory(historyManager.globalHistory);
        }
        // ESLint might complain about missing deps, but we intentionally want this to run ONLY on tab change to reset selection.
        // Including 'clientsManager.clients' causes a reset loop on selection.
    }, [activeTab]);

    // Enhanced Select Handlers (Connecting Hooks to UI State)
    const handleSelectLeadWrapper = (id: string) => {
        leadsManager.handleSelectLead(id);
        setIsLeftSidebarOpen(true);
    };

    // Effect to filtering history when Active Lead changes
    useEffect(() => {
        if (leadsManager.activeLeadId && activeTab === 'ventas') {
            const id = leadsManager.activeLeadId;
            const targetLead = leadsManager.leads.find(l => l.id === id);

            // 1. Filter Local
            const localFiltered = historyManager.globalHistory.filter(h => h.clientId === id);
            historyManager.setHistory(localFiltered);

            // 2. Refresh (Simplified for brevity, can verify later)
            if (targetLead?.isSynced) {
                getHistoryFromNotionDatabase(id).then(notionHistory => {
                    if (notionHistory.length > 0) {
                        const enrichedFresh = notionHistory.map(h => ({
                            ...h,
                            clientName: targetLead.name,
                            clientWebsite: targetLead.website
                        }));
                        historyManager.setHistory(enrichedFresh);
                    }
                });
            }
        } else if (!leadsManager.activeLeadId && activeTab === 'ventas') {
            historyManager.setHistory(historyManager.globalHistory);
        }
    }, [leadsManager.activeLeadId, activeTab]);

    const handleSelectClientWrapper = (id: string) => {
        clientsManager.handleSelectClient(id);
        setIsLeftSidebarOpen(true);
    };

    // Effect for Client History Filtering
    useEffect(() => {
        if (clientsManager.activeClientId && activeTab === 'clientes') {
            const id = clientsManager.activeClientId;
            const targetClient = clientsManager.clients.find(c => c.id === id);

            const clientEvents = historyManager.clientsHistory.filter(h => h.clientId === id);
            const enrichedEvents = clientEvents.map(h => ({
                ...h,
                clientName: targetClient ? targetClient.name : 'Cliente',
                clientWebsite: targetClient ? targetClient.website : undefined
            }));
            historyManager.setHistory(enrichedEvents);
        } else if (!clientsManager.activeClientId && activeTab === 'clientes') {
            const enrichedClientsHistory = historyManager.clientsHistory.map(h => {
                const client = clientsManager.clients.find(c => c.id === h.clientId);
                return {
                    ...h,
                    clientName: client ? client.name : (h.clientName || 'Cliente'),
                    clientWebsite: client ? client.website : undefined
                };
            });
            historyManager.setHistory(enrichedClientsHistory.sort((a, b) => b.timestamp.localeCompare(a.timestamp)));
        }
    }, [clientsManager.activeClientId, activeTab]);

    // SAVE NOTE LOGIC
    const saveNote = async (text: string, agent: string, interactionType: string) => {
        const selectedLead = activeTab === 'clientes'
            ? clientsManager.clients.find(c => c.isSelected)
            : leadsManager.leads.find(l => l.isSelected);

        if (!selectedLead) {
            showToast("No hay lead seleccionado", "info");
            return;
        }

        const tempId = `temp-${Date.now()}`;

        const optimisticItem: HistoryItem = {
            id: tempId,
            type: interactionType.toLowerCase().includes('mail') || interactionType.toLowerCase().includes('correo') ? 'email' : 'note',
            title: interactionType,
            timestamp: "Enviando...",
            description: text,
            user: { name: agent, avatarUrl: '' },
            clientId: selectedLead.id,
            clientName: selectedLead.name,
            clientWebsite: selectedLead.website,
            isSynced: false
        };

        historyManager.setHistory(prev => [optimisticItem, ...prev]);
        showToast("Guardando nota...", "info");

        // Update buckets
        if (activeTab === 'ventas') {
            historyManager.setGlobalHistory(prev => [optimisticItem, ...prev]);
        } else if (activeTab === 'clientes') {
            historyManager.setClientsHistory(prev => [optimisticItem, ...prev]);
        }

        // Webhook
        const webhookUrl = 'https://automatizaciones-n8n.tzudkj.easypanel.host/webhook/CARGAR NOTAS';
        fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                cliente: selectedLead.name,
                asignar_a: agent,
                detalle: text,
                contacto: interactionType,
                timestamp: new Date().toISOString()
            })
        }).catch(err => console.error("Webhook Note Error", err));

        // Save to Notion
        try {
            let targetLeadId = selectedLead.id;

            // Sync check for Leads
            if (activeTab === 'ventas' && !selectedLead.isSynced) {
                const synced = await syncLeadToNotion(selectedLead);
                if (synced) {
                    targetLeadId = selectedLead.id; // Updates ref? No, standard Notion ID behavior.
                    leadsManager.setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, id: targetLeadId, isSynced: true } : l));
                } else {
                    console.error("No se pudo sincronizar el lead. La nota no se guardará en Notion.");
                    showToast("Error al sincronizar lead.", "error");
                    return;
                }
            }

            let createdItem: HistoryItem | null = null;

            if (activeTab === 'clientes') {
                createdItem = await addClientHistoryToNotionDatabase(targetLeadId, text, agent, interactionType);
            } else {
                createdItem = await addHistoryToNotionDatabase(targetLeadId, text, agent, interactionType);
            }

            if (createdItem) {
                const confirmedItem: HistoryItem = {
                    ...createdItem,
                    clientName: selectedLead.name,
                    timestamp: new Date().toISOString() // Ensure timestamp matches format
                };

                // Replace optimistic
                historyManager.setHistory(prev => prev.map(item => item.id === tempId ? confirmedItem : item));

                if (activeTab === 'ventas') {
                    historyManager.setGlobalHistory(prev => prev.map(item => item.id === tempId ? confirmedItem : item));
                } else {
                    historyManager.setClientsHistory(prev => prev.map(item => item.id === tempId ? confirmedItem : item));
                }
                showToast("Nota guardada en Notion.", "success");
            } else {
                showToast("Error al guardar en Notion.", "error");
            }

        } catch (err) {
            console.error("Failed to save note:", err);
            showToast("Error crítico al guardar nota.", "error");
        }
    };

    return (
        <AppContext.Provider value={{
            ...leadsManager,
            handleSelectLead: handleSelectLeadWrapper,

            ...clientsManager,
            handleSelectClient: handleSelectClientWrapper,

            ...historyManager,
            saveNote,

            activeTab,
            setActiveTab,
            isLoadingNotion,
            supportTickets,
            isLeftSidebarOpen,
            setIsLeftSidebarOpen
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};

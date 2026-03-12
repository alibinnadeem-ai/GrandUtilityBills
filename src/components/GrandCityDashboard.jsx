import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2, FileText, Bell, Plus, Edit2, Trash2, Download, Upload,
  AlertCircle, CheckCircle, Clock, Search, X, Phone, Mail,
  MessageSquare, Wrench, TrendingUp, Users, Calendar, Filter,
  Home, Zap, Droplet, Flame, Wifi, DollarSign, Loader2, RefreshCw
} from 'lucide-react';
import api from '../api/client';

const GrandCityManagementComplete = () => {
  // State management - using API instead of localStorage
  const [owners, setOwners] = useState([]);
  const [bills, setBills] = useState([]);
  const [rentTracking, setRentTracking] = useState([]);
  const [maintenanceItems, setMaintenanceItems] = useState([]);
  const [communications, setCommunications] = useState([]);

  const [notifications, setNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBuilding, setFilterBuilding] = useState('all');
  const [filterBillType, setFilterBillType] = useState('all');

  // Loading states
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null);

  // Modal states
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showOwnerModal, setShowOwnerModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [billFormData, setBillFormData] = useState({});
  const [ownerFormData, setOwnerFormData] = useState({ name: '', mobile: '', email: '', buildings: '', notes: '' });
  const [maintenanceFormData, setMaintenanceFormData] = useState({
    buildingNumber: '', floor: '', description: '', priority: 'Medium',
    dueDate: '', status: 'Pending', assignedTo: '', cost: '', notes: ''
  });
  const [communicationFormData, setCommunicationFormData] = useState({
    ownerId: '', subject: '', message: '', method: 'Email', date: new Date().toISOString().split('T')[0]
  });

  // Fetch all data from API on mount
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setApiError(null);

      // Parallel data fetching
      const [ownersData, billsData, maintenanceData, commData, rentData] = await Promise.all([
        api.owners.getAll().catch(() => []),
        api.bills.getAll().catch(() => []),
        api.maintenance.getAll().catch(() => []),
        api.communications.getAll().catch(() => []),
        api.rent.getAll().catch(() => []),
      ]);

      setOwners(ownersData || []);
      setBills(billsData || []);
      setMaintenanceItems(maintenanceData || []);
      setCommunications(commData || []);
      setRentTracking(rentData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setApiError('Failed to load data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Get owner name by ID
  const getOwnerName = useCallback((ownerId) => {
    const owner = owners.find(o => o.id === ownerId);
    return owner ? owner.name : 'Unknown';
  }, [owners]);

  // Get bill type icon
  const getBillTypeIcon = (type) => {
    switch (type) {
      case 'Electricity': return <Zap className="w-4 h-4 text-yellow-300" />;
      case 'PTCL': return <Wifi className="w-4 h-4 text-blue-300" />;
      case 'Gas': return <Flame className="w-4 h-4 text-orange-300" />;
      case 'Water': return <Droplet className="w-4 h-4 text-cyan-300" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // CRUD operations using API
  const handleAddBill = async () => {
    try {
      if (editingItem) {
        const updated = await api.bills.update(editingItem.id, billFormData);
        setBills(bills.map(bill => bill.id === editingItem.id ? { ...updated, ...billFormData } : bill));
      } else {
        const newBill = await api.bills.create(billFormData);
        setBills([...bills, newBill]);
      }
      setShowAddBillModal(false);
      setBillFormData({});
      setEditingItem(null);
    } catch (error) {
      alert('Error saving bill: ' + error.message);
    }
  };

  const handleDeleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await api.bills.delete(id);
        setBills(bills.filter(bill => bill.id !== id));
      } catch (error) {
        alert('Error deleting bill: ' + error.message);
      }
    }
  };

  const handleEditBill = (bill) => {
    setEditingItem(bill);
    setBillFormData(bill);
    setShowAddBillModal(true);
  };

  const handleAddOwner = async () => {
    try {
      if (editingItem) {
        const updated = await api.owners.update(editingItem.id, ownerFormData);
        setOwners(owners.map(owner => owner.id === editingItem.id ? { ...updated, ...ownerFormData } : owner));
      } else {
        const newOwner = await api.owners.create(ownerFormData);
        setOwners([...owners, newOwner]);
      }
      setShowOwnerModal(false);
      setOwnerFormData({ name: '', mobile: '', email: '', buildings: '', notes: '' });
      setEditingItem(null);
    } catch (error) {
      alert('Error saving owner: ' + error.message);
    }
  };

  const handleDeleteOwner = async (id) => {
    if (window.confirm('Are you sure you want to delete this owner?')) {
      try {
        await api.owners.delete(id);
        setOwners(owners.filter(owner => owner.id !== id));
      } catch (error) {
        alert('Error deleting owner: ' + error.message);
      }
    }
  };

  const handleEditOwner = (owner) => {
    setEditingItem(owner);
    setOwnerFormData({
      ...owner,
      buildings: Array.isArray(owner.buildings) ? owner.buildings.join(', ') : owner.buildings
    });
    setShowOwnerModal(true);
  };

  const handleAddMaintenance = async () => {
    try {
      if (editingItem) {
        const updated = await api.maintenance.update(editingItem.id, maintenanceFormData);
        setMaintenanceItems(maintenanceItems.map(item => item.id === editingItem.id ? { ...updated, ...maintenanceFormData } : item));
      } else {
        const newItem = await api.maintenance.create(maintenanceFormData);
        setMaintenanceItems([...maintenanceItems, newItem]);
      }
      setShowMaintenanceModal(false);
      setMaintenanceFormData({
        buildingNumber: '', floor: '', description: '', priority: 'Medium',
        dueDate: '', status: 'Pending', assignedTo: '', cost: '', notes: ''
      });
      setEditingItem(null);
    } catch (error) {
      alert('Error saving maintenance: ' + error.message);
    }
  };

  const handleDeleteMaintenance = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance item?')) {
      try {
        await api.maintenance.delete(id);
        setMaintenanceItems(maintenanceItems.filter(item => item.id !== id));
      } catch (error) {
        alert('Error deleting maintenance: ' + error.message);
      }
    }
  };

  const handleEditMaintenance = (item) => {
    setEditingItem(item);
    setMaintenanceFormData(item);
    setShowMaintenanceModal(true);
  };

  const handleAddCommunication = async () => {
    try {
      const newComm = await api.communications.create(communicationFormData);
      setCommunications([...communications, newComm]);
      setShowCommunicationModal(false);
      setCommunicationFormData({
        ownerId: '', subject: '', message: '', method: 'Email',
        date: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      alert('Error saving communication: ' + error.message);
    }
  };

  const handleDeleteCommunication = async (id) => {
    if (window.confirm('Are you sure you want to delete this communication?')) {
      try {
        await api.communications.delete(id);
        setCommunications(communications.filter(comm => comm.id !== id));
      } catch (error) {
        alert('Error deleting communication: ' + error.message);
      }
    }
  };

  // Export data functionality
  const exportData = () => {
    const data = {
      bills,
      owners,
      rentTracking,
      maintenanceItems,
      communications,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grand-city-complete-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtering - done client-side for simplicity
  const filteredBills = bills.filter(bill => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      bill.building_number?.toLowerCase().includes(searchLower) ||
      bill.building_name?.toLowerCase().includes(searchLower) ||
      bill.floor?.toLowerCase().includes(searchLower) ||
      bill.company_name?.toLowerCase().includes(searchLower) ||
      bill.customer_id?.toLowerCase().includes(searchLower) ||
      bill.consumer_number?.toLowerCase().includes(searchLower) ||
      bill.bill_type?.toLowerCase().includes(searchLower) ||
      getOwnerName(bill.owner_id)?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'all' || bill.status === filterStatus;
    const matchesBuilding = filterBuilding === 'all' || bill.building_number === filterBuilding;
    const matchesBillType = filterBillType === 'all' || bill.bill_type === filterBillType;

    return matchesSearch && matchesStatus && matchesBuilding && matchesBillType;
  });

  // Statistics
  const stats = {
    totalBills: bills.length,
    paidBills: bills.filter(b => b.status === 'Paid').length,
    pendingBills: bills.filter(b => b.status === 'Pending').length,
    overdueBills: bills.filter(b => b.status === 'Overdue').length,
    totalAmount: bills.reduce((sum, b) => sum + (parseFloat(b.bill_amount) || 0), 0),
    electricityBills: bills.filter(b => b.bill_type === 'Electricity').length,
    ptclBills: bills.filter(b => b.bill_type === 'PTCL').length,
    gasBills: bills.filter(b => b.bill_type === 'Gas').length,
    waterBills: bills.filter(b => b.bill_type === 'Water').length,
  };

  const uniqueBuildings = [...new Set(bills.map(b => b.building_number))].sort();
  const billTypes = [...new Set(bills.map(b => b.bill_type))].sort();

  // Generate notifications
  useEffect(() => {
    const today = new Date();
    const newNotifications = [];

    bills.forEach(bill => {
      if (bill.status === 'Paid') return;

      const dueDate = new Date(bill.due_date);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        newNotifications.push({
          id: `bill-${bill.id}`,
          type: 'bill',
          message: `${bill.bill_type} bill for Building ${bill.building_number} ${bill.floor} due in ${daysUntilDue} days`,
          urgency: daysUntilDue <= 3 ? 'high' : 'medium',
          date: bill.due_date
        });
      }
    });

    maintenanceItems.forEach(item => {
      if (item.status === 'Completed') return;

      const dueDate = new Date(item.due_date);
      const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

      if (daysUntilDue <= 7 && daysUntilDue >= 0) {
        newNotifications.push({
          id: `maintenance-${item.id}`,
          type: 'maintenance',
          message: `Maintenance for Building ${item.building_number} due in ${daysUntilDue} days`,
          urgency: item.priority === 'Critical' ? 'critical' : 'medium',
          date: item.due_date
        });
      }
    });

    setNotifications(newNotifications);
  }, [bills, maintenanceItems, getOwnerName]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-white text-xl">Loading data...</p>
        </div>
      </div>
    );
  }

  // API Error state
  if (apiError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/20 border border-red-500 rounded-2xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connection Error</h2>
          <p className="text-white/80 mb-6">{apiError}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white">
      <div className="container mx-auto p-4 md:p-6 max-w-[1920px]">

        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 mb-6 border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Grand City Dashboard</h1>
                <p className="text-white/60 text-sm">Building Management System v2.0</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={exportData}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all border border-white/20"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 mb-6">
          {[
            { icon: FileText, label: 'Total Bills', value: stats.totalBills, color: 'blue' },
            { icon: CheckCircle, label: 'Paid', value: stats.paidBills, color: 'green' },
            { icon: Clock, label: 'Pending', value: stats.pendingBills, color: 'yellow' },
            { icon: AlertCircle, label: 'Overdue', value: stats.overdueBills, color: 'red' },
            { icon: DollarSign, label: 'Total Amount', value: `Rs. ${stats.totalAmount.toLocaleString()}`, color: 'purple' },
            { icon: Users, label: 'Owners', value: owners.length, color: 'cyan' },
          ].map((stat, idx) => (
            <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-3 md:p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
                </div>
                <span className="text-white/70 text-xs md:text-sm">{stat.label}</span>
              </div>
              <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 mb-6 border border-white/20">
            <h3 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Active Notifications ({notifications.length})
            </h3>
            <div className="space-y-2">
              {notifications.slice(0, 5).map(notif => (
                <div
                  key={notif.id}
                  className={`p-3 md:p-4 rounded-lg border-l-4 ${
                    notif.urgency === 'critical' ? 'bg-red-500/20 border-red-500' :
                    notif.urgency === 'high' ? 'bg-orange-500/20 border-orange-500' :
                    'bg-yellow-500/20 border-yellow-500'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-medium text-sm md:text-base flex-1">{notif.message}</p>
                    <span className="text-xs md:text-sm text-white/70 whitespace-nowrap">
                      {new Date(notif.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl mb-6 border border-white/20 overflow-x-auto">
          <div className="flex border-b border-white/20">
            {[
              { id: 'dashboard', label: 'Bills', icon: FileText },
              { id: 'owners', label: 'Owners', icon: Users },
              { id: 'maintenance', label: 'Maintenance', icon: Wrench },
              { id: 'communications', label: 'Communications', icon: MessageSquare }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white border-b-2 border-blue-400'
                    : 'text-white/70 hover:bg-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Bills Tab */}
        {activeTab === 'dashboard' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <h2 className="text-xl md:text-2xl font-bold">Bills Management - {filteredBills.length} Bills</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setBillFormData({
                    companyName: '', buildingNumber: '', buildingName: '', floor: '', unitNumber: '',
                    ownerId: '', billType: 'Electricity', dueDate: '', billMonth: '', status: 'Pending',
                    billAmount: '', accountNumber: '', consumerNumber: '', customerId: '', paidBy: 'Company',
                    referenceNumber: '', notes: ''
                  });
                  setShowAddBillModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all font-semibold shadow-lg w-full md:w-auto justify-center"
              >
                <Plus className="w-4 h-4" />
                Add Bill
              </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/50" />
                <input
                  type="text"
                  placeholder="Search bills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                />
              </div>

              <select
                value={filterBillType}
                onChange={(e) => setFilterBillType(e.target.value)}
                className="px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              >
                <option value="all">All Types</option>
                {billTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              >
                <option value="all">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Overdue">Overdue</option>
              </select>

              <select
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
                className="px-4 py-2 md:py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
              >
                <option value="all">All Buildings</option>
                {uniqueBuildings.map(b => (
                  <option key={b} value={b}>Building {b}</option>
                ))}
              </select>
            </div>

            {/* Bills Table - Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="text-left border-b border-white/20">
                    {['Type', 'Building', 'Floor', 'Owner', 'Customer ID', 'Due Date', 'Amount', 'Status', 'Actions'].map(header => (
                      <th key={header} className="py-3 px-4 text-sm font-semibold text-white/70">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map(bill => (
                    <tr key={bill.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getBillTypeIcon(bill.bill_type)}
                          <span className="font-medium">{bill.bill_type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{bill.building_number} - {bill.building_name}</td>
                      <td className="py-3 px-4">{bill.floor || '-'}</td>
                      <td className="py-3 px-4">{getOwnerName(bill.owner_id)}</td>
                      <td className="py-3 px-4 font-mono text-sm">{bill.customer_id}</td>
                      <td className="py-3 px-4">{new Date(bill.due_date).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold">Rs. {parseFloat(bill.bill_amount || 0).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          bill.status === 'Paid' ? 'bg-green-500/20 text-green-300' :
                          bill.status === 'Partial' ? 'bg-yellow-500/20 text-yellow-300' :
                          bill.status === 'Overdue' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditBill(bill)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4 text-blue-300" />
                          </button>
                          <button
                            onClick={() => handleDeleteBill(bill.id)}
                            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bills Cards - Mobile */}
            <div className="lg:hidden space-y-4">
              {filteredBills.map(bill => (
                <div key={bill.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getBillTypeIcon(bill.bill_type)}
                      <div>
                        <div className="text-lg font-bold">{bill.bill_type}</div>
                        <div className="text-sm text-white/70">Building {bill.building_number} - {bill.building_name}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      bill.status === 'Paid' ? 'bg-green-500/20 text-green-300' :
                      bill.status === 'Partial' ? 'bg-yellow-500/20 text-yellow-300' :
                      bill.status === 'Overdue' ? 'bg-red-500/20 text-red-300' :
                      'bg-blue-500/20 text-blue-300'
                    }`}>
                      {bill.status}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm mb-3">
                    <div className="flex justify-between">
                      <span className="text-white/70">Floor:</span>
                      <span>{bill.floor || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Owner:</span>
                      <span className="font-semibold">{getOwnerName(bill.owner_id)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/70">Customer ID:</span>
                      <span className="font-mono text-xs">{bill.customer_id}</span>
                    </div>
                    {bill.consumer_number && (
                      <div className="flex justify-between">
                        <span className="text-white/70">Consumer #:</span>
                        <span className="font-mono text-xs">{bill.consumer_number}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-white/70">Due Date:</span>
                      <span>{new Date(bill.due_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70">Amount:</span>
                      <span className="text-lg font-bold">Rs. {parseFloat(bill.bill_amount || 0).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-white/10">
                    <button
                      onClick={() => handleEditBill(bill)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteBill(bill.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredBills.length === 0 && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/50 text-lg">No bills found</p>
              </div>
            )}
          </div>
        )}

        {/* Owners Tab */}
        {activeTab === 'owners' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Building Owners</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setOwnerFormData({ name: '', mobile: '', email: '', buildings: '', notes: '' });
                  setShowOwnerModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Owner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {owners.map(owner => {
                const ownerBills = bills.filter(b => b.owner_id === owner.id);
                const overdueBills = ownerBills.filter(b => b.status === 'Overdue' || (b.status === 'Pending' && new Date(b.due_date) < new Date()));
                const totalBills = ownerBills.length;
                const totalAmount = ownerBills.reduce((sum, b) => sum + (parseFloat(b.bill_amount) || 0), 0);
                const billsByType = {
                  Electricity: ownerBills.filter(b => b.bill_type === 'Electricity').length,
                  PTCL: ownerBills.filter(b => b.bill_type === 'PTCL').length,
                  Gas: ownerBills.filter(b => b.bill_type === 'Gas').length,
                  Water: ownerBills.filter(b => b.bill_type === 'Water').length,
                };
                const lastComm = communications.find(c => c.owner_id === owner.id);

                return (
                  <div key={owner.id} className="bg-white/5 border border-white/20 rounded-xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-1">{owner.name}</h3>
                        <p className="text-white/60 text-sm">ID: {owner.id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditOwner(owner)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-blue-300" />
                        </button>
                        <button
                          onClick={() => handleDeleteOwner(owner.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-300" />
                        </button>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-white/60 text-sm mb-2">Buildings:</p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(owner.buildings) && owner.buildings.map(b => (
                          <span key={b} className="px-2 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm">
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 mb-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-300" />
                        <a href={`tel:${owner.mobile}`} className="text-blue-300 hover:text-blue-200 text-sm">
                          {owner.mobile}
                        </a>
                      </div>
                      {owner.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-blue-300" />
                          <a href={`mailto:${owner.email}`} className="text-blue-300 hover:text-blue-200 text-xs truncate">
                            {owner.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {lastComm && (
                      <div className="bg-white/5 rounded-lg p-3 mb-4">
                        <p className="text-white/70 text-xs mb-1">Last Communication:</p>
                        <p className="text-white text-sm font-semibold truncate">{lastComm.subject}</p>
                        <p className="text-white/60 text-xs">{new Date(lastComm.date).toLocaleDateString()} via {lastComm.method}</p>
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between bg-white/5 rounded p-2">
                        <span className="text-white/70 text-sm">Total Bills</span>
                        <span className="font-bold">{totalBills}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {billsByType.Electricity > 0 && (
                          <div className="flex items-center justify-between bg-white/5 rounded p-2">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs">{billsByType.Electricity}</span>
                          </div>
                        )}
                        {billsByType.PTCL > 0 && (
                          <div className="flex items-center justify-between bg-white/5 rounded p-2">
                            <Wifi className="w-4 h-4" />
                            <span className="text-xs">{billsByType.PTCL}</span>
                          </div>
                        )}
                        {billsByType.Gas > 0 && (
                          <div className="flex items-center justify-between bg-white/5 rounded p-2">
                            <Flame className="w-4 h-4" />
                            <span className="text-xs">{billsByType.Gas}</span>
                          </div>
                        )}
                        {billsByType.Water > 0 && (
                          <div className="flex items-center justify-between bg-white/5 rounded p-2">
                            <Droplet className="w-4 h-4" />
                            <span className="text-xs">{billsByType.Water}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between bg-white/5 rounded p-2">
                        <span className="text-white/70 text-sm">Overdue</span>
                        <span className={`font-bold ${overdueBills > 0 ? 'text-red-300' : 'text-green-300'}`}>
                          {overdueBills}
                        </span>
                      </div>
                      <div className="flex justify-between bg-white/5 rounded p-2">
                        <span className="text-white/70 text-sm">Total Amount</span>
                        <span className="font-bold text-sm">Rs. {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setCommunicationFormData({ ...communicationFormData, ownerId: owner.id });
                        setShowCommunicationModal(true);
                      }}
                      className="w-full px-3 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 text-sm font-semibold flex items-center justify-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Contact Owner
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Maintenance Tab */}
        {activeTab === 'maintenance' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Maintenance Tracking</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setMaintenanceFormData({
                    buildingNumber: '', floor: '', description: '', priority: 'Medium',
                    dueDate: '', status: 'Pending', assignedTo: '', cost: '', notes: ''
                  });
                  setShowMaintenanceModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all font-semibold"
              >
                <Plus className="w-4 h-4" />
                Add Maintenance
              </button>
            </div>

            {maintenanceItems.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/50 text-lg">No maintenance items yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {maintenanceItems.map(item => {
                  const dueDate = new Date(item.due_date);
                  const today = new Date();
                  const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

                  return (
                    <div key={item.id} className="bg-white/5 border border-white/20 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-1">Building {item.building_number}</h3>
                          <p className="text-white/60 text-sm">{item.floor}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.priority === 'High' ? 'bg-red-500/20 text-red-300' :
                          item.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {item.priority}
                        </span>
                      </div>

                      <div className="mb-4">
                        <p className="text-white font-semibold mb-2">{item.description}</p>
                        <div className="space-y-2 text-sm">
                          <p className="text-white/70">Due: <span className="text-white">{dueDate.toLocaleDateString()}</span></p>
                          {daysUntilDue >= 0 ? (
                            <p className="text-blue-300">Due in {daysUntilDue} days</p>
                          ) : (
                            <p className="text-red-300">Overdue by {Math.abs(daysUntilDue)} days</p>
                          )}
                          {item.assigned_to && (
                            <p className="text-white/70">Assigned: <span className="text-white">{item.assigned_to}</span></p>
                          )}
                          {item.cost && (
                            <p className="text-white/70">Cost: <span className="text-white font-semibold">Rs. {Number(item.cost).toLocaleString()}</span></p>
                          )}
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Completed' ? 'bg-green-500/20 text-green-300' :
                            item.status === 'In Progress' ? 'bg-yellow-500/20 text-yellow-300' :
                            'bg-blue-500/20 text-blue-300'
                          }`}>
                            {item.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditMaintenance(item)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteMaintenance(item.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Communications Tab */}
        {activeTab === 'communications' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 md:p-6 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold">Owner Communications</h2>
              <button
                onClick={() => {
                  setCommunicationFormData({
                    ownerId: '', subject: '', message: '', method: 'Email',
                    date: new Date().toISOString().split('T')[0]
                  });
                  setShowCommunicationModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition-all font-semibold"
              >
                <Plus className="w-4 h-4" />
                Log Communication
              </button>
            </div>

            {communications.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/50 text-lg">No communications logged yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {communications.slice().reverse().map(comm => {
                  const owner = owners.find(o => o.id === comm.owner_id);
                  return (
                    <div key={comm.id} className="bg-white/5 border border-white/20 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="w-5 h-5 text-blue-300" />
                            <h3 className="text-lg font-bold text-white">{owner?.name || 'Unknown'}</h3>
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">
                              {comm.method}
                            </span>
                          </div>
                          <p className="text-white/60 text-sm">{new Date(comm.date).toLocaleDateString()} at {new Date(comm.timestamp).toLocaleTimeString()}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteCommunication(comm.id)}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-300" />
                        </button>
                      </div>
                      <div>
                        <p className="text-white font-semibold mb-1">Subject: {comm.subject}</p>
                        <p className="text-white/80">{comm.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Add Bill Modal */}
        {showAddBillModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Bill' : 'Add New Bill'}</h2>
                <button onClick={() => { setShowAddBillModal(false); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {[
                  { field: 'companyName', label: 'Company Name', type: 'text' },
                  { field: 'buildingNumber', label: 'Building Number', type: 'text' },
                  { field: 'buildingName', label: 'Building Name', type: 'text' },
                  { field: 'floor', label: 'Floor', type: 'text' },
                  { field: 'ownerId', label: 'Owner', type: 'select', options: owners.map(o => ({ value: o.id, label: `${o.name} - Bldg ${Array.isArray(o.buildings) ? o.buildings.join(', ') : o.buildings}` })) },
                  { field: 'billType', label: 'Bill Type', type: 'select', options: ['Electricity', 'Gas', 'Water', 'PTCL', 'Sewerage', 'Internet', 'Maintenance'].map(t => ({ value: t, label: t })) },
                  { field: 'customerId', label: 'Customer ID', type: 'text' },
                  { field: 'consumerNumber', label: 'Consumer Number', type: 'text' },
                  { field: 'accountNumber', label: 'Account Number', type: 'text' },
                  { field: 'referenceNumber', label: 'Reference Number', type: 'text' },
                  { field: 'dueDate', label: 'Due Date', type: 'date' },
                  { field: 'billMonth', label: 'Bill Month', type: 'month' },
                  { field: 'billAmount', label: 'Bill Amount', type: 'number' },
                  { field: 'status', label: 'Status', type: 'select', options: ['Pending', 'Paid', 'Partial', 'Overdue'].map(s => ({ value: s, label: s })) },
                  { field: 'paidBy', label: 'Paid By', type: 'select', options: [{ value: 'Company', label: 'Company' }, { value: 'Owner', label: 'Owner' }] }
                ].map(({ field, label, type, options }) => (
                  <div key={field}>
                    <label className="block mb-2 text-sm font-semibold">{label}</label>
                    {type === 'select' ? (
                      <select
                        value={billFormData[field] || ''}
                        onChange={(e) => setBillFormData({ ...billFormData, [field]: field === 'ownerId' ? parseInt(e.target.value) : e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select {label}</option>
                        {options.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : type === 'number' ? (
                      <input
                        type="number"
                        value={billFormData[field] || ''}
                        onChange={(e) => setBillFormData({ ...billFormData, [field]: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <input
                        type={type}
                        value={billFormData[field] || ''}
                        onChange={(e) => setBillFormData({ ...billFormData, [field]: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${label}`}
                      />
                    )}
                  </div>
                ))}

                <div className="md:col-span-2">
                  <label className="block mb-2 text-sm font-semibold">Notes</label>
                  <textarea
                    value={billFormData.notes || ''}
                    onChange={(e) => setBillFormData({ ...billFormData, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Enter any additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowAddBillModal(false); setEditingItem(null); }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddBill}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold"
                >
                  {editingItem ? 'Update Bill' : 'Add Bill'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Owner Modal */}
        {showOwnerModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Owner' : 'Add New Owner'}</h2>
                <button onClick={() => { setShowOwnerModal(false); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { field: 'name', label: 'Name', type: 'text', required: true },
                  { field: 'mobile', label: 'Mobile Number', type: 'text', required: true },
                  { field: 'email', label: 'Email Address', type: 'email' },
                  { field: 'buildings', label: 'Buildings (comma separated)', type: 'text', required: true },
                ].map(({ field, label, type, required }) => (
                  <div key={field}>
                    <label className="block mb-2 text-sm font-semibold">{label}</label>
                    <input
                      type={type}
                      value={ownerFormData[field] || ''}
                      onChange={(e) => setOwnerFormData({ ...ownerFormData, [field]: e.target.value })}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${label}`}
                    />
                  </div>
                ))}

                <div>
                  <label className="block mb-2 text-sm font-semibold">Notes</label>
                  <textarea
                    value={ownerFormData.notes || ''}
                    onChange={(e) => setOwnerFormData({ ...ownerFormData, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    placeholder="Enter any additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowOwnerModal(false); setEditingItem(null); }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddOwner}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold"
                >
                  {editingItem ? 'Update Owner' : 'Add Owner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Maintenance Modal */}
        {showMaintenanceModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{editingItem ? 'Edit Maintenance' : 'Add New Maintenance'}</h2>
                <button onClick={() => { setShowMaintenanceModal(false); setEditingItem(null); }} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { field: 'buildingNumber', label: 'Building Number', type: 'text', required: true },
                  { field: 'floor', label: 'Floor', type: 'text' },
                  { field: 'description', label: 'Description', type: 'text', required: true },
                  { field: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High', 'Critical'] },
                  { field: 'dueDate', label: 'Due Date', type: 'date' },
                  { field: 'status', label: 'Status', type: 'select', options: ['Pending', 'In Progress', 'Completed', 'Cancelled'] },
                  { field: 'assignedTo', label: 'Assigned To', type: 'text' },
                  { field: 'cost', label: 'Cost', type: 'number' },
                ].map(({ field, label, type, options }) => (
                  <div key={field}>
                    <label className="block mb-2 text-sm font-semibold">{label}</label>
                    {type === 'select' ? (
                      <select
                        value={maintenanceFormData[field] || ''}
                        onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, [field]: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={maintenanceFormData[field] || ''}
                        onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, [field]: type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${label}`}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block mb-2 text-sm font-semibold">Notes</label>
                  <textarea
                    value={maintenanceFormData.notes || ''}
                    onChange={(e) => setMaintenanceFormData({ ...maintenanceFormData, notes: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                    placeholder="Enter any additional notes..."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => { setShowMaintenanceModal(false); setEditingItem(null); }}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMaintenance}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Communication Modal */}
        {showCommunicationModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Log Communication</h2>
                <button onClick={() => setShowCommunicationModal(false)} className="p-2 hover:bg-white/10 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                {[
                  { field: 'ownerId', label: 'Owner', type: 'select', options: owners.map(o => ({ value: o.id, label: o.name })) },
                  { field: 'subject', label: 'Subject', type: 'text', required: true },
                  { field: 'method', label: 'Method', type: 'select', options: ['Email', 'Phone', 'SMS', 'In Person'] },
                  { field: 'date', label: 'Date', type: 'date', required: true },
                ].map(({ field, label, type, options }) => (
                  <div key={field}>
                    <label className="block mb-2 text-sm font-semibold">{label}</label>
                    {type === 'select' ? (
                      <select
                        value={communicationFormData[field] || ''}
                        onChange={(e) => setCommunicationFormData({ ...communicationFormData, [field]: field === 'ownerId' ? parseInt(e.target.value) : e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select {label}</option>
                        {options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={type}
                        value={communicationFormData[field] || ''}
                        onChange={(e) => setCommunicationFormData({ ...communicationFormData, [field]: e.target.value })}
                        className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder={`Enter ${label}`}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="block mb-2 text-sm font-semibold">Message</label>
                  <textarea
                    value={communicationFormData.message || ''}
                    onChange={(e) => setCommunicationFormData({ ...communicationFormData, message: e.target.value })}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                    placeholder="Enter communication message..."
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowCommunicationModal(false)}
                  className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCommunication}
                  className="px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold"
                >
                  Save Communication
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-white/50 text-sm">
          <p>Grand City Dashboard v2.0 | Connected to Neon PostgreSQL Database</p>
          <p className="mt-1">For support, contact: ali@grandcity.pk</p>
        </div>
      </div>
    </div>
  );
};

export default GrandCityManagementComplete;

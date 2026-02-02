import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";

// Mock data based on database structure
const mockStaff = [
    { StaffID: 1, Name: "John Coordinator", Department: "IT", Role: "Coordinator" },
    { StaffID: 2, Name: "Sarah Supervisor", Department: "IT", Role: "Supervisor" },
    { StaffID: 3, Name: "Michael Manager", Department: "IT", Role: "Manager" },
    { StaffID: 4, Name: "Lisa Finance", Department: "Finance", Role: "FinanceOfficer" },
    { StaffID: 5, Name: "David Procurement", Department: "Procurement", Role: "ProcurementOfficer" }
];

const mockBudgetLines = [
    { BudgetLineID: 1, Description: "Cloud Services", Department: "IT", BudgetAmount: 15000 },
    { BudgetLineID: 2, Description: "Software Licenses", Department: "IT", BudgetAmount: 8000 },
    { BudgetLineID: 3, Description: "Office Supplies", Department: "Admin", BudgetAmount: 5000 },
    { BudgetLineID: 4, Description: "Consulting Services", Department: "HR", BudgetAmount: 20000 }
];

const mockRequests = [
    {
        RequestID: 101,
        RequesterID: 1,
        ProductService: "Cloud Services",
        ApproxAmount: 1200,
        Status: "Pending Approval",
        Urgency: "High",
        CreatedDate: "2026-01-15",
        Department: "IT"
    },
    {
        RequestID: 102,
        RequesterID: 1,
        ProductService: "Software Licenses",
        ApproxAmount: 450,
        Status: "Approved",
        Urgency: "Medium",
        CreatedDate: "2026-01-20",
        Department: "IT"
    },
    {
        RequestID: 103,
        RequesterID: 1,
        ProductService: "Office Supplies",
        ApproxAmount: 120,
        Status: "Fulfilled",
        Urgency: "Low",
        CreatedDate: "2026-01-10",
        Department: "IT"
    },
    {
        RequestID: 104,
        RequesterID: 1,
        ProductService: "Custom Development",
        ApproxAmount: 3500,
        Status: "Pending Approval",
        Urgency: "High",
        CreatedDate: "2026-01-25",
        Department: "IT"
    }
];

const mockVendors = [
    { VendorID: 1, Name: "TechSolutions Inc", Status: "Approved", Department: "IT" },
    { VendorID: 2, Name: "OfficeSupplies Co", Status: "Pending", Department: "Admin" },
    { VendorID: 3, Name: "CloudExperts Ltd", Status: "Approved", Department: "IT" }
];

const mockPOs = [
    { POID: 1, VendorID: 1, RequestID: 102, Amount: 450, Status: "Completed" },
    { POID: 2, VendorID: 3, RequestID: 101, Amount: 1200, Status: "Processing" }
];

const mockInvoices = [
    { InvoiceID: 1, POID: 1, Amount: 450, Status: "Paid", UploadDate: "2026-01-22" },
    { InvoiceID: 2, POID: 2, Amount: 1200, Status: "Pending", UploadDate: "2026-01-28" }
];

const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];
const STATUS_COLORS = {
    'Pending Approval': '#F59E0B',
    'Approved': '#10B981',
    'Fulfilled': '#0EA5E9',
    'Rejected': '#EF4444'
};

export default function App() {
    const [currentPage, setCurrentPage] = useState('initial');
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState('2026-01');
    const [requests, setRequests] = useState(mockRequests);
    const [formData, setFormData] = useState({
        requester: '',
        productService: '',
        approxAmount: '',
        documents: [],
        reason: '',
        urgency: 'Medium'
    });
    const [currentRequestId, setCurrentRequestId] = useState(null);
    const [vendors, setVendors] = useState(mockVendors);
    const [showNotifications, setShowNotifications] = useState(false);

    // Filter requests by date and user role
    const filteredRequests = requests.filter(req => {
        const reqMonth = req.CreatedDate.slice(0, 7);
        const matchesDate = reqMonth === selectedDate;
        const matchesUser = currentUser
            ? (currentUser.Role === 'Coordinator' && req.RequesterID === currentUser.StaffID) ||
            (currentUser.Role === 'Supervisor' && req.Department === currentUser.Department) ||
            (currentUser.Role === 'Manager' && req.Department === currentUser.Department) ||
            (currentUser.Role === 'Vendor' && mockPOs.some(po => po.VendorID === currentUser.VendorID && po.RequestID === req.RequestID)) ||
            (currentUser.Role === 'FinanceOfficer') ||
            (currentUser.Role === 'ProcurementOfficer')
            : true;
        return matchesDate && matchesUser;
    });

    // Calculate metrics based on filtered requests
    const metrics = {
        total: filteredRequests.length,
        pending: filteredRequests.filter(r => r.Status === 'Pending Approval').length,
        approved: filteredRequests.filter(r => r.Status === 'Approved').length,
        fulfilled: filteredRequests.filter(r => r.Status === 'Fulfilled').length,
        rejected: filteredRequests.filter(r => r.Status === 'Rejected').length
    };

    // Handle role selection on initial page
    const handleRoleSelect = (role) => {
        const user = mockStaff.find(staff => staff.Role === role) ||
            { ...mockVendors[0], Role: 'Vendor', StaffID: mockVendors[0].VendorID };
        setCurrentUser(user);
        setCurrentPage(role === 'Coordinator' ? 'requesterDashboard' :
            role === 'Supervisor' ? 'supervisorDashboard' :
                role === 'Manager' ? 'managerDashboard' :
                    role === 'Vendor' ? 'vendorDashboard' :
                        role === 'FinanceOfficer' ? 'financeDashboard' :
                            role === 'ProcurementOfficer' ? 'procurementDashboard' : 'initial');
    };

    // Handle form submission
    const handleSubmitRequest = (e) => {
        e.preventDefault();
        const newRequest = {
            RequestID: requests.length + 101,
            RequesterID: currentUser.StaffID,
            ProductService: formData.productService === 'custom' ? formData.customProduct : formData.productService,
            ApproxAmount: parseFloat(formData.approxAmount) || 0,
            Status: 'Pending Approval',
            Urgency: formData.urgency,
            CreatedDate: `${selectedDate}-15`,
            Department: currentUser.Department,
            Description: formData.reason
        };

        setRequests([...requests, newRequest]);
        setFormData({
            requester: '',
            productService: '',
            approxAmount: '',
            documents: [],
            reason: '',
            urgency: 'Medium',
            customProduct: ''
        });
        setCurrentPage(`${currentUser.Role.toLowerCase()}Dashboard`);
    };

    // Handle approval/rejection
    const handleApproval = (requestId, action) => {
        setRequests(requests.map(req =>
            req.RequestID === requestId
                ? { ...req, Status: action === 'approve' ? 'Approved' : 'Rejected' }
                : req
        ));
        setCurrentRequestId(null);
        setCurrentPage(`${currentUser.Role.toLowerCase()}Dashboard`);
    };

    // Handle vendor invoice submission
    const handleInvoiceSubmit = (e) => {
        e.preventDefault();
        // Mock invoice submission logic
        alert('Invoice submitted successfully!');
        setCurrentPage('vendorDashboard');
    };

    // Handle vendor registration
    const handleVendorSubmit = (e) => {
        e.preventDefault();
        const newVendor = {
            VendorID: vendors.length + 1,
            Name: formData.vendorName,
            Status: 'Pending',
            Department: formData.vendorDepartment
        };
        setVendors([...vendors, newVendor]);
        setFormData({
            vendorName: '',
            vendorDepartment: '',
            vendorContact: '',
            vendorEmail: ''
        });
        setCurrentPage('procurementDashboard');
    };

    // Reset form when changing pages
    useEffect(() => {
        setFormData({
            requester: currentUser?.Name || '',
            productService: '',
            approxAmount: '',
            documents: [],
            reason: '',
            urgency: 'Medium',
            customProduct: '',
            vendorName: '',
            vendorDepartment: '',
            vendorContact: '',
            vendorEmail: ''
        });
    }, [currentPage, currentUser]);

    // Page components
    const InitialPage = () => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Sketch Portal</h1>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                    Screen Simulation
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
                {['Coordinator', 'Supervisor', 'Manager', 'Vendor', 'FinanceOfficer', 'ProcurementOfficer'].map((role, index) => (
                    <motion.button
                        key={role}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRoleSelect(role)}
                        className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center border-2 border-indigo-100 hover:border-indigo-300 transition-all duration-300"
                    >
                        <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
                            <span className="text-2xl font-bold text-indigo-700">
                                {role.charAt(0)}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            {role.replace('Officer', '')}
                        </h2>
                        <p className="text-gray-600 text-center">
                            {role === 'Coordinator' && 'Submit and track requests'}
                            {role === 'Supervisor' && 'Review and Approve team requests'}
                            {role === 'Manager' && 'Final Approve team requests'}
                            {role === 'Vendor' && 'View POs and submit invoices'}
                            {role === 'FinanceOfficer' && 'Verify invoices and payments'}
                            {role === 'ProcurementOfficer' && 'Manage vendor relationships'}
                        </p>
                    </motion.button>
                ))}
            </div>
        </div>
    );

    const DashboardHeader = ({ title }) => (
        <div className="bg-white shadow-sm rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="text-gray-500 mt-1">Department: {currentUser?.Department || 'All'}</p>
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
                <div className="relative mr-4">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                    >
                        <span className="text-xl">🔔</span>
                        {filteredRequests.filter(r => r.Status === 'Pending Approval').length > 0 && (
                            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                {filteredRequests.filter(r => r.Status === 'Pending Approval').length}
                            </span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-xl p-4 z-10 border border-gray-200">
                            <h3 className="font-bold text-gray-800 mb-2">Pending Approvals</h3>
                            <div className="max-h-60 overflow-y-auto">
                                {filteredRequests
                                    .filter(r => r.Status === 'Pending Approval')
                                    .map(req => (
                                        <div
                                            key={req.RequestID}
                                            className="p-2 border-b border-gray-100 last:border-b-0 hover:bg-indigo-50 rounded cursor-pointer"
                                            onClick={() => {
                                                setCurrentRequestId(req.RequestID);
                                                setCurrentPage(`${currentUser.Role.toLowerCase()}Approve`);
                                                setShowNotifications(false);
                                            }}
                                        >
                                            <div className="font-medium">{req.ProductService}</div>
                                            <div className="text-sm text-gray-500">{req.CreatedDate}</div>
                                            <div className="text-xs mt-1 px-2 py-1 bg-amber-100 text-amber-800 rounded inline-block">
                                                {req.Urgency} Priority
                                            </div>
                                        </div>
                                    ))}
                                {filteredRequests.filter(r => r.Status === 'Pending Approval').length === 0 && (
                                    <div className="text-center text-gray-500 py-4">No pending approvals</div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center">
                    <label htmlFor="month-select" className="text-sm font-medium text-gray-700 mr-2">View Month:</label>
                    <input
                        id="month-select"
                        type="month"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>
            </div>
        </div>
    );

    const MetricsGrid = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
                { label: 'Total Requests', value: metrics.total, icon: '📋', color: 'indigo' },
                { label: 'Pending Approval', value: metrics.pending, icon: '⏳', color: 'amber' },
                { label: 'Approved', value: metrics.approved, icon: '✅', color: 'green' },
                { label: 'Fulfilled', value: metrics.fulfilled, icon: '📦', color: 'blue' }
            ].map((metric, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-white rounded-xl shadow p-6 border-l-4 border-${metric.color}-500`}
                >
                    <div className="flex items-center">
                        <div className={`text-${metric.color}-500 text-3xl mr-4`}>{metric.icon}</div>
                        <div>
                            <div className="text-gray-500 text-sm">{metric.label}</div>
                            <div className="text-2xl font-bold mt-1">{metric.value}</div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );

    const RequestTable = ({ requests, onRowClick }) => (
        <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                        <tr
                            key={request.RequestID}
                            onClick={() => onRowClick(request.RequestID)}
                            className="hover:bg-indigo-50 cursor-pointer transition-colors"
                        >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{request.RequestID}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{request.ProductService}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${request.ApproxAmount?.toLocaleString() || 'N/A'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                    className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                    style={{ backgroundColor: STATUS_COLORS[request.Status] + '20', color: STATUS_COLORS[request.Status] }}
                                >
                                    {request.Status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.Urgency === 'High' ? 'bg-red-100 text-red-800' :
                                        request.Urgency === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                                    }`}>
                                    {request.Urgency}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{request.CreatedDate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const RequesterDashboard = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardHeader title="Coordinator Dashboard" />

            <MetricsGrid />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Request Status Distribution</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Pending', value: metrics.pending },
                                        { name: 'Approved', value: metrics.approved },
                                        { name: 'Fulfilled', value: metrics.fulfilled },
                                        { name: 'Rejected', value: metrics.rejected }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                    label
                                >
                                    {[
                                        { name: 'Pending', value: metrics.pending },
                                        { name: 'Approved', value: metrics.approved },
                                        { name: 'Fulfilled', value: metrics.fulfilled },
                                        { name: 'Rejected', value: metrics.rejected }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Monthly Request Trend</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { month: 'Oct', requests: 12 },
                                { month: 'Nov', requests: 18 },
                                { month: 'Dec', requests: 15 },
                                { month: 'Jan', requests: metrics.total }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="requests" fill="#3B82F6" name="Requests" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">Your Requests</h2>
                <button
                    onClick={() => setCurrentPage('requesterForm')}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                >
                    <span className="mr-2">+</span> New Request
                </button>
            </div>

            <RequestTable
                requests={filteredRequests}
                onRowClick={(id) => {
                    setCurrentRequestId(id);
                    setCurrentPage('requesterView');
                }}
            />
        </div>
    );

    const RequesterForm = () => {
        const isCustomProduct = formData.productService === 'custom';

        return (
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-6">New Request Form</h1>

                    <form onSubmit={handleSubmitRequest}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                                <input
                                    type="text"
                                    value={currentUser?.Name || ''}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service *</label>
                                <select
                                    value={formData.productService}
                                    onChange={(e) => setFormData({ ...formData, productService: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="">Select item</option>
                                    {mockBudgetLines
                                        .filter(item => item.Department === currentUser?.Department)
                                        .map(item => (
                                            <option key={item.BudgetLineID} value={item.Description}>
                                                {item.Description} (${item.BudgetAmount.toLocaleString()})
                                            </option>
                                        ))}
                                    <option value="custom">+ Add custom item</option>
                                </select>
                            </div>

                            {isCustomProduct && (
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Custom Product/Service Name *</label>
                                    <input
                                        type="text"
                                        value={formData.customProduct || ''}
                                        onChange={(e) => setFormData({ ...formData, customProduct: e.target.value })}
                                        required={isCustomProduct}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter custom product or service name"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Approx. Amount</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">$</span>
                                    </div>
                                    <input
                                        type="number"
                                        value={formData.approxAmount}
                                        onChange={(e) => setFormData({ ...formData, approxAmount: e.target.value })}
                                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency Level *</label>
                                <select
                                    value={formData.urgency}
                                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason / Description</label>
                                <textarea
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    rows="3"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="Explain the business need for this request..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Documents (Optional)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                    <div className="space-y-1 text-center">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            stroke="currentColor"
                                            fill="none"
                                            viewBox="0 0 48 48"
                                            aria-hidden="true"
                                        >
                                            <path
                                                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                        <div className="flex text-sm text-gray-600">
                                            <label
                                                htmlFor="file-upload"
                                                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                            >
                                                <span>Upload a file</span>
                                                <input
                                                    id="file-upload"
                                                    name="file-upload"
                                                    type="file"
                                                    className="sr-only"
                                                    multiple
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        documents: Array.from(e.target.files).map(file => file.name)
                                                    })}
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                        {formData.documents.length > 0 && (
                                            <div className="mt-2 text-sm text-gray-700">
                                                <p>Attached files:</p>
                                                <ul className="list-disc list-inside">
                                                    {formData.documents.map((file, index) => (
                                                        <li key={index} className="text-indigo-600">{file}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={() => setCurrentPage('requesterDashboard')}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                Submit Request
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const SupervisorDashboard = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardHeader title="Supervisor Dashboard" />

            <MetricsGrid />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Team Performance</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'John C.', pending: 2, approved: 1, fulfilled: 1 },
                                { name: 'Sarah T.', pending: 1, approved: 3, fulfilled: 2 },
                                { name: 'Mike R.', pending: 3, approved: 0, fulfilled: 1 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                                <Bar dataKey="approved" stackId="a" fill="#10B981" name="Approved" />
                                <Bar dataKey="fulfilled" stackId="a" fill="#0EA5E9" name="Fulfilled" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Request Status Overview</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Pending Approval', value: metrics.pending },
                                        { name: 'Approved', value: metrics.approved },
                                        { name: 'Fulfilled', value: metrics.fulfilled },
                                        { name: 'Rejected', value: metrics.rejected }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                    label
                                >
                                    {[
                                        { name: 'Pending Approval', value: metrics.pending },
                                        { name: 'Approved', value: metrics.approved },
                                        { name: 'Fulfilled', value: metrics.fulfilled },
                                        { name: 'Rejected', value: metrics.rejected }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Department Requests</h2>
            <RequestTable
                requests={filteredRequests}
                onRowClick={(id) => {
                    setCurrentRequestId(id);
                    setCurrentPage('supervisorApprove');
                }}
            />
        </div>
    );

    const ApproveRejectScreen = ({ userType }) => {
        const request = requests.find(r => r.RequestID === currentRequestId);
        if (!request) return null;

        return (
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Request Approval</h1>
                            <p className="text-gray-500 mt-1">Review and take action on this request</p>
                        </div>
                        <span
                            className="px-3 py-1 rounded-full text-sm font-medium"
                            style={{
                                backgroundColor: STATUS_COLORS[request.Status] + '20',
                                color: STATUS_COLORS[request.Status]
                            }}
                        >
                            {request.Status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Request Details</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Requester</label>
                                    <p className="font-medium">{mockStaff.find(s => s.StaffID === request.RequesterID)?.Name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Product/Service</label>
                                    <p className="font-medium">{request.ProductService}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Approx. Amount</label>
                                    <p className="font-medium">${request.ApproxAmount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Urgency Level</label>
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${request.Urgency === 'High' ? 'bg-red-100 text-red-800' :
                                            request.Urgency === 'Medium' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {request.Urgency}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Description</label>
                                    <p className="text-gray-700">{request.Description || 'No description provided'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Documents</label>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">spec_sheet.pdf</span>
                                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">quote_vendor.pdf</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Action Panel</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Reassign Request (Optional)</label>
                                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                                        <option>Keep current requester</option>
                                        {mockStaff
                                            .filter(s => s.Department === currentUser?.Department && s.Role === 'Coordinator')
                                            .map(staff => (
                                                <option key={staff.StaffID} value={staff.StaffID}>
                                                    {staff.Name}
                                                </option>
                                            ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Additional Comments</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add comments for the requester..."
                                    />
                                </div>

                                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleApproval(request.RequestID, 'reject')}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => handleApproval(request.RequestID, 'approve')}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Approve Request
                                    </button>
                                </div>

                                <button
                                    onClick={() => setCurrentPage(`${userType}Dashboard`)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Back to Dashboard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const VendorDashboard = () => {
        const vendorPOs = mockPOs.filter(po =>
            mockVendors.find(v => v.VendorID === currentUser?.VendorID)?.VendorID === po.VendorID
        );

        const vendorInvoices = mockInvoices.filter(invoice =>
            vendorPOs.some(po => po.POID === invoice.POID)
        );

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <DashboardHeader title="Vendor Dashboard" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        { label: 'Active POs', value: vendorPOs.length, icon: '📄', color: 'indigo' },
                        { label: 'Submitted Invoices', value: vendorInvoices.length, icon: '🧾', color: 'blue' },
                        { label: 'Paid Invoices', value: vendorInvoices.filter(i => i.Status === 'Paid').length, icon: '✅', color: 'green' },
                        { label: 'Pending Payment', value: vendorInvoices.filter(i => i.Status === 'Pending').length, icon: '⏳', color: 'amber' }
                    ].map((metric, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`bg-white rounded-xl shadow p-6 border-l-4 border-${metric.color}-500`}
                        >
                            <div className="flex items-center">
                                <div className={`text-${metric.color}-500 text-3xl mr-4`}>{metric.icon}</div>
                                <div>
                                    <div className="text-gray-500 text-sm">{metric.label}</div>
                                    <div className="text-2xl font-bold mt-1">{metric.value}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white rounded-xl shadow p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Your Purchase Orders</h2>
                            <button
                                onClick={() => setCurrentPage('vendorInvoiceForm')}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                            >
                                <span className="mr-2">+</span> Submit Invoice
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vendorPOs.map((po) => (
                                        <tr key={po.POID} className="hover:bg-indigo-50 cursor-pointer">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">PO-{po.POID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {mockRequests.find(r => r.RequestID === po.RequestID)?.ProductService}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${po.Amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${po.Status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                        po.Status === 'Processing' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                    {po.Status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow p-6">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Invoice Status</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {vendorInvoices.map((invoice) => (
                                        <tr key={invoice.InvoiceID} className="hover:bg-indigo-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-{invoice.InvoiceID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">PO-{invoice.POID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.Amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${invoice.Status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                        invoice.Status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {invoice.Status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Contact ABS Finance Team</h2>
                    <div className="bg-indigo-50 rounded-lg p-6">
                        <div className="flex items-start">
                            <div className="text-4xl mr-4 mt-1">💬</div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800 mb-2">Need Assistance?</h3>
                                <p className="text-gray-700 mb-4">
                                    If you have questions about your POs or invoices, contact our finance team directly.
                                </p>
                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                                    Send Message to ABS
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const VendorInvoiceForm = () => (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Submit Invoice</h1>

                <form onSubmit={handleInvoiceSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Purchase Order *</label>
                            <select
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Choose a PO</option>
                                {mockPOs
                                    .filter(po =>
                                        mockVendors.find(v => v.VendorID === currentUser?.VendorID)?.VendorID === po.VendorID
                                    )
                                    .map(po => (
                                        <option key={po.POID} value={po.POID}>
                                            PO-{po.POID} - {mockRequests.find(r => r.RequestID === po.RequestID)?.ProductService} (${po.Amount.toLocaleString()})
                                        </option>
                                    ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount *</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-500 sm:text-sm">$</span>
                                </div>
                                <input
                                    type="number"
                                    required
                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Documents *</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="invoice-upload"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                        >
                                            <span>Upload invoice file</span>
                                            <input
                                                id="invoice-upload"
                                                name="invoice-upload"
                                                type="file"
                                                className="sr-only"
                                                required
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                            <textarea
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Add any additional information about this invoice..."
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setCurrentPage('vendorDashboard')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Submit Invoice
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    const FinanceDashboard = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardHeader title="Finance Officer Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Pending Verification', value: 3, icon: '🔍', color: 'amber' },
                    { label: 'Verified Invoices', value: 8, icon: '✅', color: 'green' },
                    { label: 'Sent to ERP', value: 5, icon: '📤', color: 'blue' },
                    { label: 'Total Value', value: '$12,450', icon: '💰', color: 'indigo' }
                ].map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-xl shadow p-6 border-l-4 border-${metric.color}-500`}
                    >
                        <div className="flex items-center">
                            <div className={`text-${metric.color}-500 text-3xl mr-4`}>{metric.icon}</div>
                            <div>
                                <div className="text-gray-500 text-sm">{metric.label}</div>
                                <div className="text-2xl font-bold mt-1">{metric.value}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow p-6 mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Invoices Pending Verification</h2>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PO/Request</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {mockInvoices
                                .filter(inv => inv.Status === 'Pending')
                                .map((invoice) => {
                                    const po = mockPOs.find(p => p.POID === invoice.POID);
                                    const request = mockRequests.find(r => r.RequestID === po?.RequestID);
                                    const vendor = mockVendors.find(v => v.VendorID === po?.VendorID);

                                    return (
                                        <tr key={invoice.InvoiceID} className="hover:bg-indigo-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">INV-{invoice.InvoiceID}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                PO-{po?.POID} / {request?.ProductService}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor?.Name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.Amount.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.UploadDate}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <button
                                                    onClick={() => {
                                                        setCurrentRequestId(po?.RequestID);
                                                        setCurrentPage('financeVerify');
                                                    }}
                                                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                                                >
                                                    Verify
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Invoice Verification Status</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={[
                                { name: 'Jan', pending: 3, verified: 8, sent: 5 },
                                { name: 'Dec', pending: 5, verified: 12, sent: 8 },
                                { name: 'Nov', pending: 2, verified: 10, sent: 7 }
                            ]}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                                <Bar dataKey="verified" stackId="a" fill="#10B981" name="Verified" />
                                <Bar dataKey="sent" stackId="a" fill="#3B82F6" name="Sent to ERP" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-4">Top Vendors by Spend</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'TechSolutions Inc', value: 4500 },
                                        { name: 'CloudExperts Ltd', value: 3200 },
                                        { name: 'OfficeSupplies Co', value: 1800 },
                                        { name: 'Other', value: 2950 }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                    label
                                >
                                    {[
                                        { name: 'TechSolutions Inc', value: 4500 },
                                        { name: 'CloudExperts Ltd', value: 3200 },
                                        { name: 'OfficeSupplies Co', value: 1800 },
                                        { name: 'Other', value: 2950 }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );

    const FinanceVerifyScreen = () => {
        const request = requests.find(r => r.RequestID === currentRequestId);
        const po = mockPOs.find(p => p.RequestID === currentRequestId);
        const vendor = mockVendors.find(v => v.VendorID === po?.VendorID);

        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow p-6 mb-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Invoice Verification</h1>
                            <p className="text-gray-500 mt-1">Verify invoice details against original request</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">PO Number</div>
                            <div className="font-bold">PO-{po?.POID}</div>
                            <div className="text-sm text-gray-500 mt-1">Invoice Date</div>
                            <div className="font-bold">Jan 28, 2026</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Original Request Details</h2>
                            <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Requester</label>
                                    <p className="font-medium">{mockStaff.find(s => s.StaffID === request?.RequesterID)?.Name}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Product/Service</label>
                                    <p className="font-medium">{request?.ProductService}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Approved Amount</label>
                                    <p className="font-medium text-lg">${request?.ApproxAmount?.toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">Vendor</label>
                                    <p className="font-medium">{vendor?.Name}</p>
                                </div>
                            </div>

                            <h2 className="text-lg font-semibold text-gray-800 mt-6 mb-4">Invoice Documents</h2>
                            <div className="space-y-2">
                                <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                                    <span className="text-2xl mr-3">📄</span>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">invoice_jan2026.pdf</div>
                                        <div className="text-sm text-gray-500">Uploaded: Jan 28, 2026</div>
                                    </div>
                                    <button className="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                                </div>
                                <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                                    <span className="text-2xl mr-3">🧾</span>
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-800">delivery_receipt.pdf</div>
                                        <div className="text-sm text-gray-500">Uploaded: Jan 28, 2026</div>
                                    </div>
                                    <button className="text-indigo-600 hover:text-indigo-900 font-medium">View</button>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Invoice Details (OCR Extracted)</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                                    <input
                                        type="text"
                                        defaultValue="INV-2026-0128"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Amount</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">$</span>
                                        </div>
                                        <input
                                            type="number"
                                            defaultValue={request?.ApproxAmount}
                                            className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                    <p className="mt-1 text-sm text-green-600">
                                        ✓ Matches approved amount
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Date</label>
                                    <input
                                        type="date"
                                        defaultValue="2026-01-28"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Line Items</label>
                                    <div className="border rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
                                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                <tr>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">Cloud Services</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">1</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm">$1,200.00</td>
                                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium">$1,200.00</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Verification Notes</label>
                                    <textarea
                                        rows="3"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Add verification notes here..."
                                    />
                                </div>

                                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => setCurrentPage('financeDashboard')}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Reject & Return
                                    </button>
                                    <button
                                        onClick={() => {
                                            alert('Invoice verified and sent to ERP system successfully!');
                                            setCurrentPage('financeDashboard');
                                        }}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Approve & Send to ERP
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const ProcurementDashboard = () => (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <DashboardHeader title="Procurement Officer Dashboard" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Vendors', value: vendors.length, icon: '🏢', color: 'indigo' },
                    { label: 'Pending Approval', value: vendors.filter(v => v.Status === 'Pending').length, icon: '⏳', color: 'amber' },
                    { label: 'Approved Vendors', value: vendors.filter(v => v.Status === 'Approved').length, icon: '✅', color: 'green' },
                    { label: 'Rejected Vendors', value: vendors.filter(v => v.Status === 'Rejected').length, icon: '❌', color: 'red' }
                ].map((metric, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-white rounded-xl shadow p-6 border-l-4 border-${metric.color}-500`}
                    >
                        <div className="flex items-center">
                            <div className={`text-${metric.color}-500 text-3xl mr-4`}>{metric.icon}</div>
                            <div>
                                <div className="text-gray-500 text-sm">{metric.label}</div>
                                <div className="text-2xl font-bold mt-1">{metric.value}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <div className="bg-white rounded-xl shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-800">Vendor Management</h2>
                        <button
                            onClick={() => setCurrentPage('procurementNewVendor')}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <span className="mr-2">+</span> Add New Vendor
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {vendors.map((vendor) => (
                                    <tr key={vendor.VendorID} className="hover:bg-indigo-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{vendor.Name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{vendor.Department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.Status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                    vendor.Status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {vendor.Status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="text-indigo-600 hover:text-indigo-900 font-medium mr-3">View</button>
                                            {vendor.Status === 'Pending' && (
                                                <button className="text-green-600 hover:text-green-900 font-medium">Approve</button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Vendor Status Distribution</h2>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: 'Approved', value: vendors.filter(v => v.Status === 'Approved').length },
                                        { name: 'Pending', value: vendors.filter(v => v.Status === 'Pending').length },
                                        { name: 'Rejected', value: vendors.filter(v => v.Status === 'Rejected').length }
                                    ]}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    paddingAngle={2}
                                    dataKey="value"
                                    label
                                >
                                    {[
                                        { name: 'Approved', value: vendors.filter(v => v.Status === 'Approved').length },
                                        { name: 'Pending', value: vendors.filter(v => v.Status === 'Pending').length },
                                        { name: 'Rejected', value: vendors.filter(v => v.Status === 'Rejected').length }
                                    ].map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Vendor Applications</h2>
                <div className="space-y-4">
                    {vendors
                        .filter(v => v.Status === 'Pending')
                        .slice(0, 3)
                        .map((vendor) => (
                            <div key={vendor.VendorID} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 transition-colors">
                                <div>
                                    <div className="font-bold text-gray-800">{vendor.Name}</div>
                                    <div className="text-gray-600">{vendor.Department} Department</div>
                                    <div className="mt-2 flex space-x-2">
                                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs font-medium">Pending Approval</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">Applied: Jan 25, 2026</span>
                                    </div>
                                </div>
                                <button className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors">
                                    Review Application
                                </button>
                            </div>
                        ))}
                    {vendors.filter(v => v.Status === 'Pending').length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No pending vendor applications
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const ProcurementNewVendorForm = () => (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white rounded-xl shadow p-6 mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">New Vendor Registration</h1>

                <form onSubmit={handleVendorSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name *</label>
                            <input
                                type="text"
                                value={formData.vendorName}
                                onChange={(e) => setFormData({ ...formData, vendorName: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Enter vendor company name"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                            <select
                                value={formData.vendorDepartment}
                                onChange={(e) => setFormData({ ...formData, vendorDepartment: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">Select department</option>
                                {[...new Set(mockBudgetLines.map(b => b.Department))].map(dept => (
                                    <option key={dept} value={dept}>{dept}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person *</label>
                            <input
                                type="text"
                                value={formData.vendorContact}
                                onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Full name of contact person"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                            <input
                                type="email"
                                value={formData.vendorEmail}
                                onChange={(e) => setFormData({ ...formData, vendorEmail: e.target.value })}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="contact@vendor.com"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Business Address *</label>
                            <textarea
                                rows="2"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Street address, city, state, zip code"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / VAT Number *</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="12-3456789"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                            <input
                                type="tel"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="(555) 123-4567"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Services Provided *</label>
                            <textarea
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                placeholder="Describe the products or services this vendor provides..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents</label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                                <div className="space-y-1 text-center">
                                    <svg
                                        className="mx-auto h-12 w-12 text-gray-400"
                                        stroke="currentColor"
                                        fill="none"
                                        viewBox="0 0 48 48"
                                        aria-hidden="true"
                                    >
                                        <path
                                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                    <div className="flex text-sm text-gray-600">
                                        <label
                                            htmlFor="vendor-docs"
                                            className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                                        >
                                            <span>Upload documents</span>
                                            <input
                                                id="vendor-docs"
                                                name="vendor-docs"
                                                type="file"
                                                className="sr-only"
                                                multiple
                                            />
                                        </label>
                                        <p className="pl-1">or drag and drop</p>
                                    </div>
                                    <p className="text-xs text-gray-500">W9, business license, insurance certificates (PDF only)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => setCurrentPage('procurementDashboard')}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Submit Vendor Application
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    // Render the appropriate page based on state
    return (
        <div className="min-h-screen bg-gray-50">
            {currentPage === 'initial' && <InitialPage />}

            {(currentPage === 'requesterDashboard' || currentPage === 'supervisorDashboard' ||
                currentPage === 'managerDashboard' || currentPage === 'vendorDashboard' ||
                currentPage === 'financeDashboard' || currentPage === 'procurementDashboard') && (
                    <div className="bg-indigo-700 text-white p-4 shadow-md">
                        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center mb-3 sm:mb-0">
                                <button
                                    onClick={() => {
                                        setCurrentUser(null);
                                        setCurrentPage('initial');
                                    }}
                                    className="text-white hover:text-indigo-200 transition-colors mr-3"
                                >
                                    ←
                                </button>
                                <div>
                                    <div className="text-xl font-bold">{currentUser?.Name || currentUser?.Name}</div>
                                    <div className="text-indigo-200">{currentUser?.Role.replace('Officer', '') || 'Vendor'}</div>
                                </div>
                            </div>
                            <div className="flex space-x-4">
                                {(currentPage === 'requesterDashboard' || currentPage === 'supervisorDashboard' ||
                                    currentPage === 'managerDashboard') && (
                                        <button
                                            onClick={() => setCurrentPage(`${currentUser.Role.toLowerCase()}Dashboard`)}
                                            className={`px-3 py-1 rounded ${currentPage.includes('Dashboard') ? 'bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                                        >
                                            Dashboard
                                        </button>
                                    )}

                                {currentPage === 'requesterDashboard' && (
                                    <button
                                        onClick={() => setCurrentPage('requesterForm')}
                                        className={`px-3 py-1 rounded ${currentPage === 'requesterForm' ? 'bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                                    >
                                        New Request
                                    </button>
                                )}

                                {(currentPage === 'supervisorDashboard' || currentPage === 'managerDashboard') && (
                                    <button
                                        onClick={() => setCurrentPage(`${currentUser.Role.toLowerCase()}Approve`)}
                                        className={`px-3 py-1 rounded ${currentPage.includes('Approve') ? 'bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                                    >
                                        Approvals
                                    </button>
                                )}

                                {currentPage === 'vendorDashboard' && (
                                    <button
                                        onClick={() => setCurrentPage('vendorInvoiceForm')}
                                        className={`px-3 py-1 rounded ${currentPage === 'vendorInvoiceForm' ? 'bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                                    >
                                        Submit Invoice
                                    </button>
                                )}

                                {currentPage === 'procurementDashboard' && (
                                    <button
                                        onClick={() => setCurrentPage('procurementNewVendor')}
                                        className={`px-3 py-1 rounded ${currentPage === 'procurementNewVendor' ? 'bg-indigo-800' : 'bg-indigo-600 hover:bg-indigo-500'}`}
                                    >
                                        New Vendor
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            {currentPage === 'requesterDashboard' && <RequesterDashboard />}
            {currentPage === 'requesterForm' && <RequesterForm />}
            {currentPage === 'supervisorDashboard' && <SupervisorDashboard />}
            {currentPage === 'supervisorApprove' && <ApproveRejectScreen userType="supervisor" />}
            {currentPage === 'managerDashboard' && <SupervisorDashboard />}
            {currentPage === 'managerApprove' && <ApproveRejectScreen userType="manager" />}
            {currentPage === 'vendorDashboard' && <VendorDashboard />}
            {currentPage === 'vendorInvoiceForm' && <VendorInvoiceForm />}
            {currentPage === 'financeDashboard' && <FinanceDashboard />}
            {currentPage === 'financeVerify' && <FinanceVerifyScreen />}
            {currentPage === 'procurementDashboard' && <ProcurementDashboard />}
            {currentPage === 'procurementNewVendor' && <ProcurementNewVendorForm />}
        </div>
    );
}

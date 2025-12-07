import { useAuth } from '../../hooks/useAuth';
import { Users, DollarSign, TrendingUp, Award, ArrowUpRight, ArrowDownRight, Target, Briefcase } from 'lucide-react';

export default function PartnerDashboard() {
  const { user } = useAuth();

  const stats = [
    {
      name: 'Total Leads',
      value: '24',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500',
      description: 'from last month'
    },
    {
      name: 'Active Clients',
      value: '18',
      change: '+8%',
      changeType: 'increase',
      icon: Award,
      color: 'bg-green-500',
      description: 'converted leads'
    },
    {
      name: 'Commission Earned',
      value: '₹45,000',
      change: '+23%',
      changeType: 'increase',
      icon: DollarSign,
      color: 'bg-purple-500',
      description: 'this month'
    },
    {
      name: 'Conversion Rate',
      value: '75%',
      change: '-2%',
      changeType: 'decrease',
      icon: TrendingUp,
      color: 'bg-orange-500',
      description: 'overall performance'
    },
  ];

  const recentLeads = [
    { id: 1, name: 'Acme Corp', email: 'contact@acme.com', status: 'New', date: '2024-01-15', value: '₹25,000' },
    { id: 2, name: 'Tech Solutions', email: 'info@techsol.com', status: 'In Progress', date: '2024-01-14', value: '₹35,000' },
    { id: 3, name: 'Global Industries', email: 'sales@global.com', status: 'Converted', date: '2024-01-13', value: '₹50,000' },
    { id: 4, name: 'Smart Systems', email: 'hello@smart.com', status: 'New', date: '2024-01-12', value: '₹20,000' },
  ];

  const commissionBreakdown = [
    { service: 'Tally on Cloud', clients: 8, commission: '₹18,000', percentage: 40 },
    { service: 'Windows Hosting', clients: 5, commission: '₹12,000', percentage: 27 },
    { service: 'VPS Services', clients: 3, commission: '₹9,000', percentage: 20 },
    { service: 'Others', clients: 2, commission: '₹6,000', percentage: 13 },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Welcome back, {user?.firstname || 'Partner'}!</h1>
            <p className="mt-2 text-purple-100">Here's what's happening with your partnership today</p>
          </div>
          <Briefcase className="h-16 w-16 text-white opacity-50" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">{stat.value}</p>
                <div className="mt-2 flex items-center text-sm">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 ml-1">{stat.description}</span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Leads & Commission Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Leads</h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              View All
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-xs text-gray-500">{lead.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        lead.status === 'New' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {lead.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Commission Breakdown */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Commission Breakdown</h2>
          </div>
          <div className="p-6 space-y-4">
            {commissionBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.service}</p>
                    <p className="text-xs text-gray-500">{item.clients} clients</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{item.commission}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-lg group-hover:bg-blue-200 transition-colors">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Add New Lead</h3>
              <p className="text-sm text-gray-600">Submit a new lead to track</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-lg group-hover:bg-green-200 transition-colors">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">View Earnings</h3>
              <p className="text-sm text-gray-600">Check payment history</p>
            </div>
          </div>
        </button>

        <button className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-all hover:scale-105 cursor-pointer group">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Target className="h-6 w-6 text-purple-600" />
            </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">Marketing Tools</h3>
              <p className="text-sm text-gray-600">Download resources</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

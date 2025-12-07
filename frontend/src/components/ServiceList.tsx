import { useServicesByCategoryAndType } from '../hooks/useServices';

interface ServiceListProps {
  category: string;
  type: string;
}

export default function ServiceList({ category, type }: ServiceListProps) {
  const { services, loading, error } = useServicesByCategoryAndType(category, type);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        <p className="font-medium">Error loading services</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-8 rounded-lg text-center">
        <p className="text-lg font-medium">No services found</p>
        <p className="text-sm mt-2">No services available for {category} / {type}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {services.map((service) => (
        <div
          key={service.id}
          className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200"
        >
          {service.imageUrl && (
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-48 object-cover rounded-lg mb-4"
            />
          )}
          
          <h3 className="text-xl font-bold text-gray-900 mb-2">{service.name}</h3>
          
          {service.description && (
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
          )}

          <div className="flex items-center gap-4 mb-4">
            {service.ram && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">RAM:</span>{' '}
                <span className="text-gray-600">{service.ram}</span>
              </div>
            )}
            {service.storage && (
              <div className="text-sm">
                <span className="font-medium text-gray-700">Storage:</span>{' '}
                <span className="text-gray-600">{service.storage}</span>
              </div>
            )}
          </div>

          {service.features && service.features.length > 0 && (
            <div className="mb-4">
              <p className="font-medium text-gray-700 text-sm mb-2">Features:</p>
              <ul className="space-y-1">
                {service.features.slice(0, 3).map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-blue-600 mr-2">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            {service.monthlyPrice ? (
              <div>
                <span className="text-2xl font-bold text-blue-600">
                  ₹{service.monthlyPrice}
                </span>
                <span className="text-gray-600 text-sm">/month</span>
              </div>
            ) : (
              <span className="text-gray-600 text-sm">Contact for pricing</span>
            )}
            
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Buy Service
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

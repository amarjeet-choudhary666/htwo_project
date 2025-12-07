import UserServiceRequestForm from '../components/UserServiceRequestForm';

export default function ServiceRequest() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Service Request</h1>
          <p className="mt-2 text-gray-600">
            Need help with a service? Fill out the form below and we'll get back to you.
          </p>
        </div>
        <UserServiceRequestForm />
      </div>
    </div>
  );
}
import { useAuth } from '../contexts/AuthContext';

const Profile = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-black relative">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 relative z-10">
        <div className="px-4 py-6 sm:px-0">
          <div className="mt-20 glass-card border-l-4 border-red-600">
            <div className="px-4 py-5 sm:p-6">
              <h1 className="text-2xl font-bold text-white mb-6 text-glow">Profile</h1>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Name</label>
                  <p className="mt-1 text-sm text-white">{user?.user_metadata?.name || 'Not available'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Email</label>
                  <p className="mt-1 text-sm text-white">{user?.email || 'Not available'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400">Member Since</label>
                  <p className="mt-1 text-sm text-white">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>

                <div className="pt-6">
                  <button
                    onClick={signOut}
                    className="bg-red-600 hover:bg-red-700 cyber-button"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;



















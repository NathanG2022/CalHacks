import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverStatus, setServerStatus] = useState('unknown');

  useEffect(() => {
    checkServerHealth();
    fetchItems();
  }, []);

  const checkServerHealth = async () => {
    try {
      await apiService.healthCheck();
      setServerStatus('connected');
    } catch (error) {
      setServerStatus('disconnected');
    }
  };

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await apiService.getItems();
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.trim()) return;

    try {
      setLoading(true);
      const item = await apiService.createItem({ 
        name: newItem, 
        completed: false 
      });
      setItems([...items, item]);
      setNewItem('');
    } catch (error) {
      console.error('Failed to add item:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (id) => {
    try {
      const item = items.find(item => item.id === id);
      const updatedItem = await apiService.updateItem(id, {
        ...item,
        completed: !item.completed
      });
      setItems(items.map(item => 
        item.id === id ? updatedItem : item
      ));
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await apiService.deleteItem(id);
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">CalHacks Dashboard</h1>
              <div className="ml-4 flex items-center">
                <span className="text-sm text-gray-500">Server Status:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                  serverStatus === 'connected' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {serverStatus}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name || 'User'}!</span>
              <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">CalHacks Todo Items</h2>
              
              {/* Add Item Form */}
              <form onSubmit={handleAddItem} className="mb-6">
                <div className="flex gap-4">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Add a new CalHacks task..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Item'}
                  </button>
                </div>
              </form>

              {/* Items List */}
              <div className="space-y-3">
                {loading && items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">Loading items...</div>
                ) : items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No items yet. Add one above!
                  </div>
                ) : (
                  items.map(item => (
                    <div
                      key={item.id}
                      className={`flex items-center p-4 border rounded-lg ${
                        item.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className={`ml-3 flex-1 ${
                        item.completed ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {item.name}
                      </span>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="ml-3 text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

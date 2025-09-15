import { useState, useEffect, useRef } from "react";
import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_BASE_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data.data.user);
        setFormData({ name: res.data.data.user.name });
      } catch (err) {
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImageFile(file);
      // Create a URL for previewing the image instantly
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setLoading(true);

    const apiData = new FormData();
    apiData.append('name', formData.name);
    if (profileImageFile) {
      apiData.append('profilePicture', profileImageFile);
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.put(`${API_BASE_URL}/api/users/updateMe`, apiData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data.data.user);
      alert("Profile updated successfully!");
    } catch (err) {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading settings...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  // Construct the full URL for the user's profile picture
  const profileImageUrl = user.profilePicture
    ? `${API_BASE_URL}/${user.profilePicture.replace(/\\/g, '/')}`
    : 'path/to/default/avatar.png';

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      <form onSubmit={handleSaveChanges}>
        {/* Personal Info */}
        <div className="bg-white shadow rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Personal Information</h2>
          <p className="text-gray-500 text-sm">Update your personal details here.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="text-sm text-gray-600">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Email Address</label>
              <input
                type="email"
                value={user.email}
                className="w-full mt-1 border rounded-md px-3 py-2 text-sm bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
          </div>

          {/* Profile picture */}
          <div className="flex items-center space-x-4 mt-4">
            <img
              src={previewImage || profileImageUrl}
              alt="Profile"
              className="w-14 h-14 rounded-full border object-cover"
            />
            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
            />
            {/* Button to trigger file input */}
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50"
            >
              Change
            </button>
          </div>
        </div>

        {/* Save Changes Button */}
        <div className="flex justify-end space-x-3 mt-8">
          <button type="button" className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
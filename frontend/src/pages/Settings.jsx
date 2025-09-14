import { useState } from "react";

export default function Settings() {
  const [theme, setTheme] = useState(false);
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState({
    expense: true,
    budget: true,
    promo: false,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Personal Info */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Personal Information</h2>
        <p className="text-gray-500 text-sm">
          Update your personal details here.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600">Name</label>
            <input
              type="text"
              defaultValue="Jane Doe"
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Email Address</label>
            <input
              type="email"
              defaultValue="jane.doe@example.com"
              className="w-full mt-1 border rounded-md px-3 py-2 text-sm"
            />
          </div>
        </div>

        {/* Profile picture */}
        <div className="flex items-center space-x-4 mt-4">
          <img
            src="https://randomuser.me/api/portraits/women/44.jpg"
            alt="profile"
            className="w-14 h-14 rounded-full border"
          />
          <button className="px-3 py-2 border rounded-md text-sm hover:bg-gray-50">
            Change
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Preferences</h2>
        <p className="text-gray-500 text-sm">
          Customize your app experience.
        </p>

        {/* Theme */}
        <div className="flex justify-between items-center py-3 border-t">
          <div>
            <p className="font-medium text-gray-700">Theme</p>
            <p className="text-sm text-gray-500">
              Switch between light and dark themes.
            </p>
          </div>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={theme}
              onChange={() => setTheme(!theme)}
              className="sr-only"
            />
            <span
              className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                theme ? "bg-purple-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                  theme ? "translate-x-5" : ""
                }`}
              />
            </span>
          </label>
        </div>

        {/* Currency */}
        <div className="flex justify-between items-center py-3 border-t">
          <div>
            <p className="font-medium text-gray-700">Currency</p>
            <p className="text-sm text-gray-500">
              Default currency for transactions.
            </p>
          </div>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="INR">INR (₹)</option>
          </select>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-semibold">Notifications</h2>
        <p className="text-gray-500 text-sm">
          Manage how you receive notifications.
        </p>

        {[
          {
            key: "expense",
            label: "Expense Notifications",
            desc: "Receive notifications for new expenses.",
          },
          {
            key: "budget",
            label: "Budget Alerts",
            desc: "Get notified when you’re nearing budget limits.",
          },
          {
            key: "promo",
            label: "Promotional Updates",
            desc: "Receive news about new features and offers.",
          },
        ].map((item) => (
          <div
            key={item.key}
            className="flex justify-between items-center py-3 border-t"
          >
            <div>
              <p className="font-medium text-gray-700">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notifications[item.key]}
                onChange={() =>
                  setNotifications({
                    ...notifications,
                    [item.key]: !notifications[item.key],
                  })
                }
                className="sr-only"
              />
              <span
                className={`w-11 h-6 flex items-center rounded-full p-1 transition ${
                  notifications[item.key] ? "bg-purple-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`bg-white w-4 h-4 rounded-full shadow transform transition ${
                    notifications[item.key] ? "translate-x-5" : ""
                  }`}
                />
              </span>
            </label>
          </div>
        ))}
      </div>

      {/* Save Changes */}
      <div className="flex justify-end space-x-3">
        <button className="px-4 py-2 border rounded-md text-sm hover:bg-gray-50">
          Cancel
        </button>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
          Save Changes
        </button>
      </div>
    </div>
  );
}

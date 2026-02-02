import React from 'react';
import { configs } from '../utils/livecodesConfig';

function SidebarMenu({ setActiveConfig, activeConfig }) {
  const categories = {
    Frontend: ['HTML/CSS', 'JavaScript', 'React.js'],
    Backend: ['Node.js', 'Python']
  };

  const handleClick = (key) => {
    setActiveConfig(configs[key]);
  };

  const isActive = (key) => JSON.stringify(configs[key]) === JSON.stringify(activeConfig);

  return (
    <div className="w-64 bg-gray-800 text-white p-4 overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">Code Playground</h2>
      {Object.entries(categories).map(([category, items]) => (
        <div key={category} className="mb-4">
          <h3 className="text-lg font-semibold mb-2">{category}</h3>
          <ul>
            {items.map((item) => (
              <li key={item}>
                <button
                  onClick={() => handleClick(item)}
                  className={`block w-full text-left p-2 rounded hover:bg-gray-700 ${
                    isActive(item) ? 'bg-gray-600' : ''
                  }`}
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export default SidebarMenu;
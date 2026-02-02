import React, { useState } from 'react';
import SidebarMenu from '../components/SidebarMenu';
import CodePlayground from '../components/CodePlayground';
import { configs } from '../utils/livecodesConfig';

function CodePlaygroundPage() {
  const [activeConfig, setActiveConfig] = useState(configs['HTML/CSS']);

  return (
    <div className="flex h-screen">
      <SidebarMenu setActiveConfig={setActiveConfig} activeConfig={activeConfig} />
      <div className="flex-1">
        <CodePlayground config={activeConfig} />
      </div>
    </div>
  );
}

export default CodePlaygroundPage;
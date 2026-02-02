import { createPlayground } from "livecodes";

let playgroundInstance;

export async function loadPlayground(config) {
  if (!playgroundInstance) {
    playgroundInstance = await createPlayground("#livecodes-container", config);
  } else {
    await playgroundInstance.setConfig(config);
  }
}

export const configs = {
  'HTML/CSS': {
    template: "vanilla",
    files: {
      "index.html": "<h1>Hello LiveCodes</h1>",
      "style.css": "h1 { color: red }"
    }
  },
  'JavaScript': {
    language: "javascript",
    code: "console.log('Hello JavaScript!')"
  },
  'React.js': {
    template: "react",
    files: {
      "App.jsx": `
        export default function App(){
          return <h1>Hello React from LiveCodes!</h1>;
        }
      `
    }
  },
  'Node.js': {
    language: "javascript",
    params: { runtime: "node" },
    code: "console.log('Node program executed!')"
  },
  'Python': {
    language: "python",
    code: "print('Hello Python')"
  }
};
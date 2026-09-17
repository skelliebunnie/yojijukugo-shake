const resultEl = document.getElementById('results');
const statusEl = document.getElementById('status');
const permissionBtn = document.getElementById('permissionBtn');

let prevOpt = 1;

const options = fetch("./yojijukugo.json");

async function getData() {
  const url = "https://skelliebunnie.github.io/yojijukugo-shake/yojijukugo.json";
  
  try {
    const response = await fetch(url);
    
    if(!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log(result);
    
  } catch(error) {
    console.error(error.message);
    
  }
}
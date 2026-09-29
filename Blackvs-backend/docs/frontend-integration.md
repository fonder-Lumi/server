# BlackVS React/Vite integration

```ts
const API = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8080";

const metrics = await fetch(`${API}/api/metrics`).then(r => r.json());
const server = await fetch(`${API}/api/server`).then(r => r.json());

const events = new EventSource(`${API}/api/events`);
events.onmessage = (event) => {
  const live = JSON.parse(event.data);
  // Update Zustand/React state.
};
```

For a production deployment use HTTPS + authentication/RBAC. Do not expose
the Rust agent port 9100 to the public network.

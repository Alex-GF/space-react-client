# 🚀 SPACE Client SDK for React

The **SPACE React SDK** provides fully-typed React/TypeScript **components, hooks, and utilities** to seamlessly integrate your web apps with SPACE.  

With this SDK you can:

- ⚡ **Connect** a React application to a **SPACE** instance (HTTP + WebSocket).
- 🔑 Generate and manage **Pricing Tokens** directly in the client.
- 🧩 **Activate/deactivate UI components** declaratively with the `<Feature>` component.
- 🔔 **Subscribe to SPACE pricing events** to keep your UI in sync.  

:::warning important 
This SDK is intended for research and experimentation. For production usage, see **[License & Disclaimer](#-license--disclaimer)**.
:::

---

## ⚠️ Important Note

- **Feature evaluation is always based on the Pricing Token.**  
  `space-react-client` does not call SPACE directly to check features; instead, it uses the Pricing Token stored in the browser’s `localStorage`.  
  (See [SPACE communication protocol](../../introduction.mdx) for more details on how pricing tokens work.)

---

## 📦 Installation

Install with your package manager of choice:

```bash
npm install space-react-client
# or
yarn add space-react-client
# or
pnpm add space-react-client
```

**Peer dependencies:**

- `react >= 18`
- `react-dom >= 18`

---

## ⚡ Quick Start

The minimal setup to connect to SPACE, load a user’s Pricing Token, and render UI conditionally with `<Feature>`.

### 1. Wrap your app with `SpaceProvider`

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { SpaceProvider } from 'space-react-client';
import App from './App';

const config = {
  url: 'http://localhost:5403', // Your SPACE instance URL
  apiKey: 'YOUR_API_KEY',       // API key issued by SPACE
  allowConnectionWithSpace: true,
};

createRoot(document.getElementById('root')!)
  .render(
    <SpaceProvider config={config}>
      <App />
    </SpaceProvider>
  );
```

:::warning  
Setting `allowConnectionWithSpace: false` disables all connections to SPACE.  
This means you can still evaluate features from a token, but **event listeners (e.g., pricing_created, pricing_archived, etc.) as well as methods like `setUserId` and `generateUserPricingToken` will not work.**  
:::

### 2. Identify the user and load a Pricing Token

```tsx
import { useEffect } from 'react';
import { useSpaceClient } from 'space-react-client';

export function TokenBootstrapper() {
  const spaceClient = useSpaceClient();

  useEffect(() => {
    spaceClient.setUserId('user-123')
      .then(() => console.log("User's pricing token set"))
      .catch(console.error);

    // Listen for SPACE sync events
    const onSync = () => console.log('Connected & synchronized with SPACE');
    spaceClient.on('synchronized', onSync);

    return () => spaceClient.off('synchronized', onSync);
  }, [spaceClient]);

  return <YourComponent />;
}
```

### 3. Gate UI with `<Feature>`

```tsx
import { Feature, On, Default, Loading, ErrorFallback } from 'space-react-client';

export function MeetingButton() {
  return (
    <Feature id="zoom-meetings">
      <On>
        {/* Rendered when feature is enabled */}
        <button>Start meeting</button>
      </On>
      <Default>
        {/* Rendered when feature is disabled */}
        <button disabled>Upgrade to enable meetings</button>
      </Default>
      <Loading>
        {/* Rendered while evaluating */}
        <span>Checking your plan…</span>
      </Loading>
      <ErrorFallback>
        {/* Rendered on error */}
        <span>Could not verify your feature access.</span>
      </ErrorFallback>
    </Feature>
  );
}
```

---

### 🔄 Alternative: Token-only mode (no live connection)

Set `allowConnectionWithSpace: false` to disable the WebSocket client.  
You can then inject a Pricing Token from your backend:

```tsx
import { useEffect } from 'react';
import { usePricingToken } from 'space-react-client';

export function InjectTokenFromServer() {
  const tokenService = usePricingToken();

  useEffect(() => {
    fetch('/api/my-pricing-token')
      .then(res => res.text()) // token as string
      .then(token => tokenService.updatePricingToken(token))
      .catch(console.error);
  }, [tokenService]);

  return <YourComponent />;
}
```

---

## 📚 API Reference

### Providers

- **`SpaceProvider({ config, children })`**  
  Initializes the client and provides context.  

  - **Props:**  
    - `config: SpaceConfiguration`  
      - `url: string` — SPACE instance URL  
      - `apiKey: string` — Authentication key emitted by SPACE
      - `allowConnectionWithSpace: boolean` — If `false`, event listeners take no effect (default: `true`)
    - `children: React.ReactNode`  

---

### Hooks

- **`useSpaceClient(): SpaceClient`**  
  Access the connected SPACE client. Throws if not available.  

- **`usePricingToken(): TokenService`**  
  Manage Pricing Tokens in context. Available even if live connection is disabled.  

---

### UI Components

- **`<Feature id="feature-id">…</Feature>`**  
  Declarative feature gating.  

  - **Subcomponents:**  
    - `<On>` — Rendered when feature evaluates to `true`.  
    - `<Default>` — Rendered when feature evaluates to `false`.  
    - `<Loading>` — Rendered while evaluating.  
    - `<ErrorFallback>` — Rendered on errors (invalid id, expired token, etc).  

:::warning
The `feature-id` is a string in the format `saasName-featureName`, always in lowercase.
For example, to reference the **pets feature from PetClinic**, the resulting feature-id would be: `petclinic-pets`.
:::

---

### Client API

`SpaceClient` is instantiated by `SpaceProvider`.  

**Methods:**

- `on(event, callback)` — Listen to SPACE events.  
- `off(event?, callback?)` — Remove listeners. **If no args, removes all listeners**.
- `setUserId(userId)` — Set user for evaluations, **generates a pricing token, and stores it**.
- `generateUserPricingToken()` — Generate and **return** a fresh Pricing Token for the user configured with `setUserId`. It **does not store** the token.

**✅ Supported Events**

- **`synchronized`** — Client is connected and synced with SPACE.  
- **`pricing_created`** — A new pricing was added.  
- **`pricing_activated`** — A pricing moved from archived → active.  
- **`pricing_archived`** — A pricing moved from active → archived.  
- **`service_disabled`** — A service was disabled.  
- **`error`** — Connection or processing error.  

All events (except `synchronized` and `error`) include the following object:  

```typescript
{
  serviceName: string;       // REQUIRED: The name of the service that triggered the event
  pricingVersion?: string;   // OPTIONAL: The version of the pricing involved
}
```

---

### Token Service

**Methods:**

- `updatePricingToken(token)` — Validates & stores a pricing token.  
- `getPricingToken()` — Return parsed token payload.  
- `evaluateFeature(featureId)` — Returns `true | false | null`.  

Token expectations:  
- `exp: number` — UNIX expiration.  
- `features: Record<string, { eval: boolean; limit?: number | null; used?: number | null }>`  

---

## 🛡️ Security Considerations

- **Do not expose SPACE API keys in production.**  
  Instead, issue Pricing Tokens from your backend and deliver them to the client.  
- Tokens are validated client-side with the `exp` claim. Rotate or shorten TTLs as needed.  

---

## ⚙️ Development & Tooling

The project uses the following main tools and technologies:

<div style="display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '1rem'">

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge)
![Rollup](https://img.shields.io/badge/-Rollup-EC4A3F?logo=rollup.js&logoColor=white&style=for-the-badge)
![Vitest](https://img.shields.io/badge/-Vitest-6E9F18?logo=vitest&logoColor=white&style=for-the-badge)
![Testing Library](https://img.shields.io/badge/-Testing%20Library-E33332?logo=testinglibrary&logoColor=white&style=for-the-badge)
![Axios](https://img.shields.io/badge/-Axios-5A29E4?logo=axios&logoColor=white&style=for-the-badge)
![Socket.io](https://img.shields.io/badge/-Socket.io-010101?logo=socketdotio&logoColor=white&style=for-the-badge)

</div>

---

## 📄 License & Disclaimer

This project is licensed under the **MIT License**. See [LICENSE](https://github.com/Alex-GF/space-react-client/blob/main/LICENSE).  

:::warning
This SDK is part of **ongoing research** in pricing-driven devops.
It is still in an early stage and not intended for production use.
:::

---

## ❓ FAQ

**Q:** Do I need SPACE running to use this?  
**A:** Yes, for live connectivity. In token-only mode, you just need a Pricing Token from your backend.  

**Q:** Why does `useSpaceClient` throw?  
**A:** Likely because you’re outside `SpaceProvider`, or `allowConnectionWithSpace` is `false`.  

**Q:** What’s the format for feature IDs?  
**A:** A **feature id** must:  

- Always include a dash (`-`).  
- Match exactly the keys present in the Pricing Token payload.  

The format is built internally as: `saasName-featureName`, all in lowercase.

For example, if you want to instantiate the feature `pets` from the SaaS **PetClinic**, the feature id would be: `petclinic-pets`.
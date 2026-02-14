import { createBrowserRouter } from "react-router";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./components/pages/Dashboard";
import { Operations } from "./components/pages/Operations";
import { Revenue } from "./components/pages/Revenue";
import { Products } from "./components/pages/Products";
import { ExpenseInput } from "./components/pages/ExpenseInput";
import { Customers } from "./components/pages/Customers";
import { Reports } from "./components/pages/Reports";
import { SmartCenter } from "./components/pages/SmartCenter";
import { AIAssistant } from "./components/pages/AIAssistant";
import { Automation } from "./components/pages/Automation";
import { SettingsPage } from "./components/pages/SettingsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "operations", Component: Operations },
      { path: "revenue", Component: Revenue },
      { path: "products", Component: Products },
      { path: "expense-input", Component: ExpenseInput },
      { path: "customers", Component: Customers },
      { path: "reports", Component: Reports },
      { path: "smart-center", Component: SmartCenter },
      { path: "ai-assistant", Component: AIAssistant },
      { path: "automation", Component: Automation },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);

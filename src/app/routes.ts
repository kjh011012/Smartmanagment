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
import { FixedCosts } from "./components/pages/FixedCosts";
import { Specialties } from "./components/pages/Specialties";
import { SettingsPage } from "./components/pages/SettingsPage";
import { RefundPolicy } from "./components/pages/RefundPolicy";

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
      { path: "fixed-costs", Component: FixedCosts },
      { path: "specialties", Component: Specialties },
      {
        path: "fees-taxes",
        lazy: async () => {
          const { FeesTaxes } = await import("./components/pages/FeesTaxes");
          return { Component: FeesTaxes };
        },
      },
      { path: "refund-policy", Component: RefundPolicy },
      {
        path: "subsidies",
        lazy: async () => {
          const { Subsidies } = await import("./components/pages/Subsidies");
          return { Component: Subsidies };
        },
      },
      { path: "settings", Component: SettingsPage },
    ],
  },
]);
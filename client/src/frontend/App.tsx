import { useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { Layout } from "./components/Layout";

import Home from "./pages/Home";
import Entry from "./pages/Entry";
import Issue from "./pages/Issue";
import Search from "./pages/Search";
import Dashboard from "./pages/Dashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/not-found";

function AdminProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, setLocation] = useLocation();
  const isAuthenticated = localStorage.getItem("admin_auth") === "true";

  useEffect(() => {
    if (!isAuthenticated) {
      const currentPath = window.location.pathname;
      setLocation(`/admin?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, setLocation]);

  return isAuthenticated ? <Component /> : null;
}

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/entry" component={Entry} />
        <Route path="/issue" component={Issue} />
        <Route path="/search" component={Search} />
        <Route path="/dashboard">
          <AdminProtectedRoute component={Dashboard} />
        </Route>
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard">
          <AdminProtectedRoute component={AdminDashboard} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;

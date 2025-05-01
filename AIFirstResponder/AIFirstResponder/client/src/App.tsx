import { Switch, Route } from "wouter";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

export default App;

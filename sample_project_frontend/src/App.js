import React from "react";
import "./App.css";
import UsersPage from "./features/users/UsersPage";

// PUBLIC_INTERFACE
function App() {
  /** SPA root component rendering Users CRUD page. */
  return (
    <div className="App">
      <UsersPage />
    </div>
  );
}

export default App;

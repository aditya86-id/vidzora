import React from "react";
import Sidebar from "../../Header/Sidebar.jsx";
import HomePage from "../../HomePage/HomePage.jsx";

function Home({ sideNavBar }) {
  return (
    <div className="Home bg-black">
      <Sidebar sideNavBar={sideNavBar} />
      <HomePage sideNavBar={sideNavBar} />
    </div>
  );
}

export default Home;

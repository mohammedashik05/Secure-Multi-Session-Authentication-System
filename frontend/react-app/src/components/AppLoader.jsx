import React from "react";
import Lottie from "lottie-react";
import loadingAnimation from "../assets/animations/loading.json";
import "../style/AppLoader.css";

export default function AppLoader() {
  return (
    <div className="app-loader">
      <Lottie
        animationData={loadingAnimation}
        loop
        autoplay
        style={{ width: 220 }}
      />
      <p className="loader-text">Securing your session...</p>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift, faPlusCircle, faClock } from "@fortawesome/free-solid-svg-icons";
import "./UserDashboard.css";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");  // Get token from localStorage

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post("http://localhost:8080/lmsa/user/dashboard", null, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData(response.data);  // Set the data for your component
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false); // Finish loading state
      }
    };
  
    if (token) {
      fetchUserData();  // Make sure to call fetchUserData when token is available
    } else {
      setLoading(false);
    }
  }, [token]);

  const getNextTier = (currentTier) => {
    const tierMap = {
      Bronze: { nextTier: "Silver", points: 500 },
      Silver: { nextTier: "Gold", points: 1000 },
      Gold: { nextTier: "Platinum", points: 1600 },
      Platinum: { nextTier: "Diamond", points: 2500 },
    };
    return tierMap[currentTier] || { nextTier: "", points: 0 };
  };

  const totalPoints = userData?.points || 0;
  const membershipTier = userData?.membershipTier || "";
  const { nextTier, points } = getNextTier(membershipTier);
  const pointsToNextTier = points - totalPoints;

  if (loading) {
    return <div className="container mt-5 text-center">Loading...</div>;
  }

  // Function to format date as 'Apr 18, 2025'
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="dashboard">
      <h2>Hi, {userData?.name || "User"}!</h2>

      <div className="points-card">
        <div className="points-info">
          <h1>{totalPoints.toLocaleString()} Points</h1>
          {membershipTier && <span className="badge">{membershipTier} Member</span>}
        </div>

        <div className="quick-actions">
          <button className="action-btn">
            <FontAwesomeIcon icon={faGift} /> Redeem Rewards
          </button>
          <button className="action-btn">
            <FontAwesomeIcon icon={faPlusCircle} /> Earn More
          </button>
          <button className="action-btn">
            <FontAwesomeIcon icon={faClock} /> Activity
          </button>
        </div>

        {nextTier && (
          <div className="progress-info">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((totalPoints / points) * 100).toFixed(1)}%` }}
              ></div>
            </div>
            <p>{pointsToNextTier} points to {nextTier} <br /> Keep going! You're almost there.</p>
          </div>
        )}
      </div>

      <div className="activity-section">
        <h4>Recent Activity</h4>
        <div className="activity-list">
          {userData?.recentActivity?.length > 0 ? (
            userData.recentActivity.map((activity, index) => (
                <div className="activity-item" key={index}>
                <strong style={{ color: activity.requestType === "Earned" ? "green" : "#333" }}>
                  {activity.requestType} {activity.pointsUsed} points used
                </strong>
                <div>{activity.rewardDescription}</div>
                <small>{formatDate(activity.requestDate)}</small>
              </div>
            ))
          ) : (
            <p>No recent activity found.</p>
          )}
        </div>
      </div>

      <div className="rewards-section">
        <div className="rewards-header">
          <h4>Featured Rewards</h4>
          <a href="#">See All</a>
        </div>
        <div className="rewards-grid">
          <div className="reward-card">
            <img src="/coffee.png" alt="Coffee" />
            <p>Free Coffee<br /><strong>100 points</strong></p>
          </div>
          <div className="reward-card">
            <img src="/voucher.png" alt="Voucher" />
            <p>Movie Voucher<br /><strong>500 points</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;

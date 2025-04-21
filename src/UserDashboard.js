import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGift,
  faPlusCircle,
  faClock,
} from "@fortawesome/free-solid-svg-icons";
import "./UserDashboard.css";
import { useNavigate } from "react-router-dom";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.post(
          "http://localhost:8080/lmsa/user/dashboard",
          null,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    } else {
      navigate("/");
    }
  }, [token]);

  if (!userData?.name) {
    navigate("/");
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/");
  };

  const tierMap = [
    {
      name: "Bronze",
      nextTier: "Silver",
      pointsLowerLimit: 0,
      pointsUpperLimit: 500,
    },
    {
      name: "Silver",
      nextTier: "Gold",
      pointsLowerLimit: 500,
      pointsUpperLimit: 1000,
    },
    {
      name: "Gold",
      nextTier: "Platinum",
      pointsLowerLimit: 1000,
      pointsUpperLimit: 1600,
    },
    {
      name: "Platinum",
      nextTier: "Diamond",
      pointsLowerLimit: 1600,
      pointsUpperLimit: 2500,
    },
    {
      name: "Diamond",
      nextTier: "",
      pointsLowerLimit: 2500,
      pointsUpperLimit: Infinity,
    },
  ];

  const totalPoints = userData?.points || 0;

  let currentTier = "";
  let nextTier = "";
  let pointsToNextTier = "";
  let progressWidth = 0;

  for (let tier of tierMap) {
    if (
      totalPoints >= tier.pointsLowerLimit &&
      totalPoints < tier.pointsUpperLimit
    ) {
      currentTier = tier.name;
      nextTier = tier.nextTier;
      pointsToNextTier = tier.pointsUpperLimit - totalPoints;
      progressWidth =
        ((totalPoints - tier.pointsLowerLimit) /
          (tier.pointsUpperLimit - tier.pointsLowerLimit)) *
        100;
      break;
    }
  }

  if (totalPoints >= 2500) {
    currentTier = "Diamond";
  }

  if (loading) {
    return <div className="container mt-5 text-center">Loading...</div>;
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleRedeemClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const redeemReward = async (rewardId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/lmsa/user/redeem`, // Example API endpoint for redeeming a reward
        { rewardId }, // Send the reward ID (you can add more params if needed)
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data.success) {
        alert(
          `Reward redemption request submitted successfully!: ${response.data.reward.name}`
        );
        setUserData(response.data.user);
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Error redeeming reward. Please try again.");
    }
  };

  const rewards = [
    {
      id: 1,
      name: "Amazon Voucher",
      rewardDescription: "₹500 Amazon Gift Card",
      numberOfPoints: 500,
      img: "https://i.postimg.cc/SNw5c0L1/logo.png",
    },
    {
      id: 2,
      name: "Flipkart Coupon",
      rewardDescription: "₹300 Flipkart Discount Coupon",
      numberOfPoints: 300,
      img: "https://i.postimg.cc/L4W8PXJt/flipkart.png",
    },
    {
      id: 3,
      name: "Starbucks Voucher",
      rewardDescription: "₹200 Coffee Voucher",
      numberOfPoints: 200,
      img: "https://i.postimg.cc/Z5tYfMF0/starbucks.png",
    },
  ];

  // Activity List Component
  const ActivityList = ({ activities }) => {
    return (
      <div className="activity-list">
        {activities?.length > 0 ? (
          activities.map((activity, index) => (
            <div className="activity-item" key={index}>
              <strong
                style={{
                  color: activity.requestType === "Earned" ? "green" : "#333",
                }}
              >
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
    );
  };

  return (
    <div className="dashboard">
      {/* Logout Button at the top-right */}
      <Box
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
        padding={2}
      >
        <Button
          class="logout-btn"
          variant="outlined"
          color="primary"
          onClick={handleLogout}
          sx={{ height: 39, minWidth: 100 }}
        >
          Logout
        </Button>
      </Box>
      <h2>Hi, {userData?.name || "User"}!</h2>

      <div className="points-card">
        <div className="points-info">
          <h1>{totalPoints.toLocaleString()} Points</h1>
          {currentTier && <span className="badge">{currentTier} Member</span>}
        </div>

        <div className="quick-actions">
          <button className="action-btn" onClick={handleRedeemClick}>
            <FontAwesomeIcon icon={faGift} />
            Redeem Rewards
          </button>
          <button className="action-btn">
            <FontAwesomeIcon icon={faPlusCircle} />
            Earn More
          </button>
          <button className="action-btn">
            <FontAwesomeIcon icon={faClock} />
            Activity
          </button>
        </div>

        {nextTier && nextTier !== "" && (
          <div className="progress-info">
            <div className="progress-bar">
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{
                    width: `${Math.min(
                      Math.max((totalPoints / 2500) * 100, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
            <p>
              <br />
              <b>
                {pointsToNextTier} points to {nextTier}
              </b>{" "}
              <br /> Keep going! You're almost there.
            </p>
          </div>
        )}
      </div>

      <div className="activity-section">
        <h4>Recent Activity</h4>
        <ActivityList activities={userData?.recentActivity} />
      </div>

      <div className="rewards-section">
        <div className="rewards-header">
          <h4>Featured Rewards</h4>
          <button onClick={handleRedeemClick} className="see-all-button">
            See All
          </button>
        </div>
        <div className="rewards-grid">
          {rewards.map((reward) => (
            <div
              className="reward-card"
              key={reward.id}
              onClick={() => redeemReward(reward.id)} // Call redeemReward when a reward is clicked
            >
              <img src={reward.img} alt={reward.name} />
              <p>
                {reward.name}
                <br />
                <strong>{reward.numberOfPoints} points</strong>
              </p>
              <p>{reward.rewardDescription}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for Redeem Rewards */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <span className="close-btn" onClick={handleCloseModal}>
              &times;
            </span>
            <h3>Select a Reward to Redeem</h3>
            <div className="rewards-grid">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`reward-card ${
                    reward.numberOfPoints > totalPoints ? "disabled" : ""
                  }`}
                  style={
                    reward.numberOfPoints > totalPoints
                      ? { cursor: "not-allowed", opacity: 0.5 }
                      : {}
                  }
                  onClick={() =>
                    reward.numberOfPoints <= totalPoints &&
                    redeemReward(reward.id)
                  }
                >
                  <img src={reward.img} alt={reward.name} />
                  <h3>{reward.name}</h3>
                  <p>{reward.rewardDescription}</p>
                  <strong>{reward.numberOfPoints} Points</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

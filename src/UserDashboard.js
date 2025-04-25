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

const UserDashboard = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState([]);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);

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

    const fetchRewards = async () => {
      try {
        const response = await axios.get("http://localhost:8080/lmsa/rewards", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Log to verify the fetched rewards data
        console.log("Fetched Rewards:", response.data);

        // Map the fetched rewards and format them
        const formattedRewards = response.data.map((reward) => ({
          id: reward.id,
          name: reward.name,
          rewardDescription: reward.rewardDescription,
          numberOfPoints: reward.numberOfPoints,
          imgUrl: reward.imgUrl,
        }));

        setRewards(formattedRewards);
      } catch (error) {
        console.error("Error fetching rewards:", error);
      }
    };
    if (token) {
      fetchUserData();
      fetchRewards();
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

  const handleRedeemClick = () => {
    setIsModalOpen(true); // Open the rewards modal
  };

  const handleActivityClick = () => {
    setIsActivityModalOpen(true); // Open the activity modal
  };

  const handleCloseModal = () => {
    setIsModalOpen(false); // Close the rewards modal
  };

  const handleCloseActivityModal = () => {
    setIsActivityModalOpen(false); // Close the activity modal
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

  for (let tier of tierMap) {
    if (
      totalPoints >= tier.pointsLowerLimit &&
      totalPoints < tier.pointsUpperLimit
    ) {
      currentTier = tier.name;
      nextTier = tier.nextTier;
      pointsToNextTier = tier.pointsUpperLimit - totalPoints;
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

  const redeemReward = async (rewardId) => {
    try {
      const reward = rewards.find((r) => r.id === rewardId);
      const response = await axios.post(
        `http://localhost:8080/lmsa/rewards/redeem`,
        reward,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data === "User transaction processed successfully.") {
        alert(
          `Reward redemption request submitted successfully: ${reward.name}`
        );
        setUserData(response.data.user);
      } else {
        alert("Error: " + response.data);
      }
    } catch (error) {
      console.error("Error redeeming reward:", error);
      alert("Error redeeming reward. Please try again.");
    }
  };

  // Activity List Component
  const ActivityList = ({ activities }) => {
    return (
      <div className="activity-list">
        <ul>
          {activities?.length > 0 ? (
            activities.map((entry, idx) => {
              let sign = "";
              if (entry.requestType) {
                const lowerType = entry.requestType.toLowerCase();
                if (lowerType.includes("earned")) {
                  sign = "+";
                } else {
                  sign = "−";
                }
              }
              return (
                <li key={idx} className="history-item">
                  <div className="history-row">
                    {/* Points and Description */}
                    <div className="history-col points">
                      {`${sign} ${entry.pointsUsed} points`}
                      <span className="description">
                        {entry.rewardDescription}
                      </span>
                    </div>

                    {/* Status */}
                    <div
                      className={`history-col status ${entry.status?.toLowerCase()}`}
                    >
                      <strong>{entry.status}</strong>
                    </div>

                    {/* Reason */}
                    <div className="history-col reason">
                      {entry.reason ? entry.reason : ""}
                    </div>

                    {/* Date */}
                    <div className="history-col date">
                      {formatDate(entry.requestDate)}
                    </div>
                  </div>
                </li>
              );
            })
          ) : (
            <ul className="no-history">No Recent Activity</ul>
          )}
        </ul>
      </div>
    );
  };

  //  const ActivityList = ({ activities }) => {
  //    return (
  //      <div className="activity-list">
  //        <ul>
  //          {activities?.length > 0 ? (
  //            activities.map((entry, idx) => {
  //              let sign = "";
  //              if (entry.requestType) {
  //                const lowerType = entry.requestType.toLowerCase();
  //                if (lowerType.includes("earned")) {
  //                  sign = "+";
  //                } else {
  //                  sign = "−";
  //                }
  //              }
  //              return (
  //                <li key={idx} className="history-item">
  //                  <div className="history-row">
  //                    <div className="history-col points">
  //                      {`${sign} ${entry.pointsUsed} points`}
  //                      <span className="description">
  //                        {entry.rewardDescription}
  //                      </span>
  //                    </div>
  //
  //                    <div
  //                      className={`history-col status ${entry.status?.toLowerCase()}`}
  //                    >
  //                      <strong>{entry.status}</strong>
  //                    </div>
  //
  //                    <div className="history-col reason">
  //                      {entry.reason ? entry.reason : ""}
  //                    </div>
  //
  //                    <div className="history-col date">
  //                      {formatDate(entry.requestDate)}
  //                    </div>
  //                  </div>
  //                </li>
  //              );
  //            })
  //          ) : (
  //            <li className="no-history">No history available</li>
  //          )}
  //        </ul>
  //      </div>
  //    );
  //  };

  return (
    <div className="dashboard">
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
      <h2>Hi, {userData?.name || "User"}!</h2>

      <div className="points-card">
        <div className="points-info">
          <h1>{totalPoints.toLocaleString()} Points</h1>
          {currentTier && <span className="badge">{currentTier} Member</span>}
        </div>

        <div className="quick-actions">
          <button className="action-btn mar-right" onClick={handleRedeemClick}>
            <FontAwesomeIcon icon={faGift} />
            Redeem Rewards
          </button>
          <button className="action-btn mar-center">
            <FontAwesomeIcon icon={faPlusCircle} />
            Earn More
          </button>
          <button className="action-btn mar-left" onClick={handleActivityClick}>
            <FontAwesomeIcon icon={faClock} />
            Activity
          </button>
        </div>

        {nextTier !== "" && (
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
        <h4>
          <strong>Recent Activity</strong>
          <br />
          <br />
        </h4>
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
          {rewards.length === 0 ? (
            <p>No rewards available.</p>
          ) : (
            rewards.map((reward) => (
              <div
                className={`reward-card ${isProcessing ? "disabled" : ""}`}
                key={reward.id}
                onClick={async () => {
                  if (isProcessing) return; // prevent action if processing
                  setIsProcessing(true); // start processing
                  try {
                    await redeemReward(reward.id); // your backend call
                  } catch (error) {
                    console.error("Redeem failed:", error);
                  } finally {
                    setIsProcessing(false); // re-enable after call finishes
                  }
                }}
              >
                <img src={reward.imgUrl} alt={reward.name} />
                <p>
                  {reward.name}
                  <br />
                  <strong>{reward.numberOfPoints} points</strong>
                </p>
                <p>{reward.rewardDescription}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal for Activity */}
      {isActivityModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={handleCloseActivityModal}>
              &times;
            </span>
            <h3>Recent Activity</h3>
            <ActivityList activities={userData?.recentActivity} />
          </div>
        </div>
      )}

      {/* Modal for Redeem Rewards */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="close-btn" onClick={handleCloseModal}>
              &times;
            </span>
            <h3>Select a Reward to Redeem</h3>
            <div className="rewards-grid">
              {rewards.length === 0 ? (
                <p>No rewards available</p>
              ) : (
                rewards.map((reward) => (
                  <div
                    className={`reward-card ${isRedeeming ? "disabled" : ""}`}
                    key={reward.id}
                    onClick={async () => {
                      if (isRedeeming) return;
                      setIsRedeeming(true);
                      try {
                        await redeemReward(reward.id);
                      } catch (error) {
                        console.error("Redeem failed:", error);
                      } finally {
                        setIsRedeeming(false);
                      }
                    }}
                  >
                    <img src={reward.imgUrl} alt={reward.name} />
                    <p>{reward.name}</p>
                    <strong>{reward.numberOfPoints} points</strong>
                    <p>{reward.rewardDescription}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;

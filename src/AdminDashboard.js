import React, { useState, useEffect } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPlayCircle,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";

import { faUpload } from "@fortawesome/free-solid-svg-icons";
import Button from "@mui/material/Button";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

const tiers = [
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

const getTier = (points) => {
  for (const tier of tiers) {
    if (points >= tier.pointsLowerLimit && points < tier.pointsUpperLimit) {
      return tier;
    }
  }
  return tiers[tiers.length - 1];
};

const AdminDashboard = () => {
  const [adminData, setAdminData] = useState(null);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [action, setAction] = useState("EARNED");
  const [amount, setAmount] = useState(0);
  const [rewardDescription, setRewardDescription] = useState("");
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [isStartEnabled, setIsStartEnabled] = useState(false);
  const [isEndEnabled, setIsEndEnabled] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/lmsa/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdminData(response.data);
        setFilteredCustomers(response.data.allCustomersDTOList || []);
        if (
          response.data.allCustomersDTOList &&
          response.data.allCustomersDTOList.length > 0
        ) {
          setSelectedCustomer(response.data.allCustomersDTOList[0]);
        }
      } catch (error) {
        console.error("Error fetching admin data:", error);
        localStorage.clear();
        navigate("/");
      }
    };

    if (token) {
      fetchAdminData();
    } else {
      navigate("/");
    }
  }, [token]);

  useEffect(() => {
    const updateSyncButtons = () => {
      const now = new Date();
      const currentHour = now.getHours();

      setIsStartEnabled(currentHour >= 6 && currentHour < 7);
      setIsEndEnabled(currentHour >= 22 && currentHour < 23);
    };

    updateSyncButtons(); // initial call

    const intervalId = setInterval(updateSyncButtons, 60000); // update every minute

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!adminData) return;
    const filtered = adminData.allCustomersDTOList.filter((c) => {
      const term = searchTerm.toLowerCase();
      return (
        c.customerId.toString().toLowerCase().includes(term) ||
        (c.name && c.name.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term))
      );
    });
    setFilteredCustomers(filtered);
    if (
      selectedCustomer &&
      !filtered.some((c) => c.customerId === selectedCustomer.customerId)
    ) {
      setSelectedCustomer(filtered.length > 0 ? filtered[0] : null);
    }
  }, [searchTerm, adminData, selectedCustomer]);

  const handleSelectCustomer = (customer) => {
    setSelectedCustomer(customer);
  };

  const formatPointsText = (customer) => {
    if (customer.customerId === "C001") {
      return customer.points.toLocaleString() + " pioms";
    }
    return customer.points.toLocaleString() + " points";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    if (isNaN(date)) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleApplyChange = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    if (!amount || amount <= 0) return;
    if (!rewardDescription.trim()) return;

    const rewardHistoryDto = {
      customerId: selectedCustomer.customerId,
      name: selectedCustomer.name,
      typeOfRequest: action,
      rewardDescription: rewardDescription.trim(),
      numberOfPoints: amount,
    };

    try {
      const response = await axios.post(
        "http://localhost:8080/lmsa/admin/points",
        rewardHistoryDto,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const updatedCustomers = [...filteredCustomers];
        const idx = updatedCustomers.findIndex(
          (c) => c.customerId === selectedCustomer.customerId
        );
        if (idx !== -1) {
          const cust = { ...updatedCustomers[idx] };
          if (!cust.recentActivity) cust.recentActivity = [];
          if (action === "EARNED") {
            cust.points += amount;
          } else if (action === "EXPIRED") {
            cust.points = Math.max(0, cust.points - amount);
          }
          cust.recentActivity.unshift({
            requestType: action,
            pointsUsed: amount,
            rewardDescription: rewardDescription.trim(),
            requestDate: new Date().toISOString(),
          });
          if (cust.recentActivity.length > 10) {
            cust.recentActivity = cust.recentActivity.slice(0, 10);
          }
          updatedCustomers[idx] = cust;
          setFilteredCustomers(updatedCustomers);
          setSelectedCustomer(cust);
        }
        window.location.reload();
        alert("Applied Successfully");
      } else {
        alert("Failed to apply change");
      }
    } catch (error) {
      alert("Error applying change: " + error.message);
    }
  };

  const handleBulkFileChange = (e) => {
    if (e.target.files.length > 0) {
      setBulkFile(e.target.files[0]);
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) {
      alert("Please select a CSV file to upload.");
      return;
    }
    setBulkUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", bulkFile);

      const response = await axios.post(
        "http://localhost:8080/lmsa/admin/points/bulk-upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.status === 200) {
        alert("Bulk upload successful.");
        const refreshed = await axios.get(
          "http://localhost:8080/lmsa/admin/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setAdminData(refreshed.data);
        setFilteredCustomers(refreshed.data.allCustomersDTOList || []);
        if (
          refreshed.data.allCustomersDTOList &&
          refreshed.data.allCustomersDTOList.length > 0
        ) {
          setSelectedCustomer(refreshed.data.allCustomersDTOList[0]);
        }
        setBulkFile(null);
        document.getElementById("uploadInput").value = "";
      } else {
        alert("Bulk upload failed.");
      }
    } catch (error) {
      alert("Error during bulk upload: " + error.message);
    } finally {
      setBulkUploading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const startSync = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await axios.get(
        "http://localhost:8080/lmsa/source/begin",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Started syncing successfully!");
      console.log("Sync started.");
    } catch (error) {
      console.error("Error applying changes:", error);
      alert("Something went wrong. Try again.");
    }
  };

  const stopSync = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.get(
        "http://localhost:8080/lmsa/source/end",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Finalized syncing successfully!");
      console.log("Sync finalized:", response.data);
    } catch (error) {
      console.error("Error finalizing sync:", error);
      const errorMsg =
        error.response?.data?.message || "Something went wrong. Try again.";
      alert("Error: " + errorMsg);
    }
  };

  if (!adminData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="header">
        <h1>Points Management</h1>
        <div className="header-right">
          <div className="stats">
            <p className="stat">
              Total Points Awarded:&nbsp;
              {adminData.totalPointsAwarded.toLocaleString()}
            </p>
            <p className="stat">
              Active Users:&nbsp;{adminData.activeUsers.toLocaleString()}
            </p>
          </div>
          <Button
            class="logout-btn"
            variant="outlined"
            color="primary"
            onClick={handleLogout}
            sx={{ height: 36, minWidth: 100 }}
          >
            Logout
          </Button>
        </div>
      </header>

      <div className="main-content">
        <section className="left-column">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              placeholder="Search by Customer ID, Name, or Email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              autoComplete="off"
              spellCheck="false"
            />
          </form>

          <div className="list-details-container">
            <div className="customer-list">
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Customer ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => {
                    const isSelected =
                      selectedCustomer &&
                      customer.customerId === selectedCustomer.customerId;
                    return (
                      <tr
                        key={customer.customerId}
                        className={isSelected ? "selected-row" : ""}
                        tabIndex={0}
                        role="button"
                        aria-pressed={isSelected}
                        onClick={() => handleSelectCustomer(customer)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSelectCustomer(customer);
                          }
                        }}
                      >
                        <td className="cell-status">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectCustomer(customer)}
                            onClick={(e) => e.stopPropagation()}
                            className="checkbox"
                          />
                        </td>
                        <td className="cell-id">{customer.customerId}</td>
                        <td
                          className={`cell-name ${
                            ["C003", "C004", "C005", "C006"].includes(
                              customer.customerId.toString()
                            )
                              ? "font-bold"
                              : ""
                          }`}
                        >
                          {customer.name}
                        </td>
                        <td
                          className={`cell-email ${
                            ["C003", "C004", "C005"].includes(
                              customer.customerId.toString()
                            )
                              ? "font-bold"
                              : ""
                          }`}
                        >
                          {customer.email}
                        </td>
                        <td className="cell-points">
                          {formatPointsText(customer)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="customer-details">
              {selectedCustomer ? (
                <>
                  <h2 className="customer-name">{`${selectedCustomer.name} - ${selectedCustomer.customerId}`}</h2>
                  <div className="points-container">
                    <div className="points-labels">
                      <span>Current Points:</span>
                      <span className="points-value">
                        {selectedCustomer.points.toLocaleString()}
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${Math.min(
                            Math.max((selectedCustomer.points / 2500) * 100, 0),
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="tier-info">
                      <span>Tier: {getTier(selectedCustomer.points).name}</span>
                      {getTier(selectedCustomer.points).nextTier?.trim() ? (
                        <span>
                          Next: {getTier(selectedCustomer.points).nextTier}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <form className="points-form" onSubmit={handleApplyChange}>
                    <label htmlFor="action" className="form-label">
                      Action
                    </label>
                    <select
                      id="action"
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      className="form-select"
                    >
                      <option value="EARNED">Points Earned</option>
                      <option value="EXPIRED">Points Expired</option>
                    </select>

                    <label htmlFor="amount" className="form-label">
                      Points
                    </label>
                    <input
                      id="amount"
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                      className="form-input"
                      required
                    />

                    <label htmlFor="rewardDescription" className="form-label">
                      Request Description
                    </label>
                    <input
                      id="rewardDescription"
                      type="text"
                      value={rewardDescription}
                      onChange={(e) => setRewardDescription(e.target.value)}
                      placeholder="Enter request description"
                      className="form-input"
                      required
                    />

                    <button type="submit" className="apply-btn">
                      <FontAwesomeIcon icon={faCheckCircle} />
                      <span>Apply Change</span>
                    </button>
                  </form>

                  <div className="history-log">
                    <h3>History Log</h3>
                    <ul>
                      {selectedCustomer.recentActivity &&
                      selectedCustomer.recentActivity.length > 0 ? (
                        selectedCustomer.recentActivity.map((entry, idx) => {
                          let sign = "";
                          if (entry.requestType) {
                            const lowerType = entry.requestType.toLowerCase();
                            console.log("Ratnender", lowerType);
                            if (lowerType.includes("earned")) {
                              sign = "+";
                            } else {
                              sign = "−";
                            }
                          }
                          return (
                            <li key={idx} className="history-item">
                              <span>{`${sign} ${entry.pointsUsed} points – ${entry.rewardDescription}`}</span>
                              <span className="history-date">
                                {formatDate(entry.requestDate)}
                              </span>
                            </li>
                          );
                        })
                      ) : (
                        <li className="no-history">No history available</li>
                      )}
                    </ul>
                  </div>
                </>
              ) : (
                <p>No customer selected</p>
              )}
            </div>
          </div>
        </section>

        <section className="right-column">
          <h2>Bulk Points Update</h2>
          <form onSubmit={handleBulkUpload} className="bulk-upload-form">
            <label
              htmlFor="uploadInput"
              className="bulk-upload-label"
              title="Customer Id, Name, Request Type, Reward Description, Amount, etc."
            >
              <FontAwesomeIcon icon={faUpload} /> Upload CSV
              <div className="bulk-upload-desc">
                Customer Id, Name, Request Type, Reward Description, Amount,
                etc.
              </div>
            </label>
            <input
              id="uploadInput"
              type="file"
              accept=".csv, .xlsx"
              onChange={handleBulkFileChange}
              className="bulk-upload-input"
            />
            <button
              type="submit"
              disabled={bulkUploading}
              className="upload-btn"
            >
              <FontAwesomeIcon icon={faUpload} />
              <span>Upload</span>
            </button>
          </form>
          <h2>
            <br />
            Sync Request from Source System
          </h2>
          {!isStartEnabled && (
            <span style={{ color: "red", fontSize: "0.9rem" }}>
              Start Sync available from 6AM to 7AM
            </span>
          )}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              className="apply-btn full-width"
              onClick={startSync}
              disabled={!isStartEnabled}
              title={
                !isStartEnabled
                  ? "Start Sync available from 6AM to 7AM"
                  : "Start Sync"
              }
            >
              <FontAwesomeIcon icon={faPlayCircle} />
              <span style={{ marginLeft: "0.5rem" }}>Start Sync</span>
            </button>
          </div>
          {!isEndEnabled && (
            <span style={{ color: "red", fontSize: "0.9rem" }}>
              End Sync available from 10PM to 11PM
            </span>
          )}
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              type="button"
              className="apply-btn full-width"
              onClick={stopSync}
              disabled={!isEndEnabled}
              title={
                !isEndEnabled
                  ? "End Sync available from 10PM to 11PM"
                  : "End Sync"
              }
            >
              <FontAwesomeIcon icon={faStopCircle} />
              <span style={{ marginLeft: "0.5rem" }}>End Sync</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

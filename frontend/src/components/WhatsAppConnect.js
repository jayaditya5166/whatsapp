import React, { useState, useEffect, useRef } from "react";
import { fetchWhatsAppQR } from "../services/api";
import io from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "https://your-render-app-name.onrender.com";

const WhatsAppConnect = ({ tenantId }) => {
  const [qr, setQr] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const pollingRef = useRef(null);
  const socketRef = useRef(null);

  const pollStatus = async () => {
    try {
      const res = await fetch(`/api/${tenantId}/whatsapp/status`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.status === "ready") {
        setReady(true);
        setMessage("WhatsApp is ready!");
        setQr(null);
        setError(null);
        if (pollingRef.current) clearTimeout(pollingRef.current);
        return;
      } else {
        setReady(false);
        setMessage("Waiting for scan...");
        pollingRef.current = setTimeout(pollStatus, 2000);
      }
    } catch (err) {
      setError("Failed to check WhatsApp status.");
      setReady(false);
      setMessage("");
      if (pollingRef.current) clearTimeout(pollingRef.current);
    }
  };

  const handleRequestQr = async () => {
    setLoading(true);
    setError(null);
    setMessage("Requesting QR code...");
    setQr(null);
    setReady(false);
    if (pollingRef.current) clearTimeout(pollingRef.current);
    try {
      const response = await fetchWhatsAppQR(tenantId);
      if (response.status === "ready") {
        setQr(null);
        setMessage(response.message || "WhatsApp is already connected!");
        setReady(true);
        setError(null);
      } else if (response.status === "qr") {
        setQr(response.qr);
        setMessage(response.message || "Scan this QR code with WhatsApp");
        setReady(false);
        setError(null);
        pollStatus(); // Start polling for ready status
      } else {
        setError(response.error || "Failed to get QR code");
        setReady(false);
      }
    } catch (err) {
      setError("Failed to connect to WhatsApp. Please try again.");
      setReady(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async () => {
    setLoading(true);
    setError(null);
    setMessage("");
    setQr(null);
    setReady(false);
    try {
      const res = await fetch(`/api/${tenantId}/whatsapp/status`, {
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (data.status === "ready") {
        setReady(true);
        setMessage("WhatsApp is ready!");
      } else {
        setReady(false);
        setMessage("WhatsApp is not connected. Click 'Connect WhatsApp' to get started.");
      }
    } catch (err) {
      setError("Failed to check WhatsApp status.");
    } finally {
      setLoading(false);
    }
  };

  // Setup socket.io connection and listeners
  useEffect(() => {
    if (!tenantId) return;
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.emit("join-tenant", tenantId);
    socket.on("whatsapp-qr", (data) => {
      if (data.tenantId === tenantId) {
        setQr(data.qr);
        setMessage("Scan this QR code with WhatsApp");
        setReady(false);
        setError(null);
      }
    });
    socket.on("whatsapp-ready", (data) => {
      if (data.tenantId === tenantId) {
        setReady(true);
        setMessage("WhatsApp is ready!");
        setQr(null);
        setError(null);
        if (pollingRef.current) clearTimeout(pollingRef.current);
      }
    });
    return () => {
      socket.disconnect();
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [tenantId]);

  // On mount, check status and poll until ready
  useEffect(() => {
    if (!tenantId) return;
    setLoading(true);
    setError(null);
    setMessage("");
    setQr(null);
    setReady(false);
    if (pollingRef.current) clearTimeout(pollingRef.current);
    const poll = async () => {
      try {
        const res = await fetch(`/api/${tenantId}/whatsapp/status`, {
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await res.json();
        if (data.status === "ready") {
          setReady(true);
          setMessage("WhatsApp is ready!");
        } else {
          setReady(false);
          setMessage("WhatsApp is not connected. Click 'Connect WhatsApp' to get started.");
          pollingRef.current = setTimeout(poll, 2000);
        }
      } catch (err) {
        setError("Failed to check WhatsApp status.");
      } finally {
        setLoading(false);
      }
    };
    poll();
    return () => {
      if (pollingRef.current) clearTimeout(pollingRef.current);
    };
  }, [tenantId]);

  return (
    <div className="mb-4">
      <h3>WhatsApp Connection</h3>
      <button
        className="btn btn-success mb-2 mr-2"
        onClick={handleRequestQr}
        disabled={loading || ready}
      >
        {loading ? "Connecting..." : ready ? "Connected" : "Connect WhatsApp"}
      </button>
      {/* <button
        className="btn btn-outline-primary mb-2 ms-2"
        onClick={handleCheckStatus}
        disabled={loading}
      >
        Check WhatsApp Status
      </button> */}
      {ready && (
        <span className="badge bg-success ms-2" style={{ fontSize: '1rem' }}>✔ Connected</span>
      )}
      {!ready && !loading && (
        <span className="badge bg-danger ms-2" style={{ fontSize: '1rem' }}>Not Connected</span>
      )}
      {qr && (
        <div>
          <p>{message}</p>
          <img src={qr} alt="WhatsApp QR" style={{ width: 256, height: 256 }} />
        </div>
      )}
      {!qr && message && <div className="text-success mt-2">{message}</div>}
      {error && <div className="text-danger mt-2">{error}</div>}
      {!qr && !message && !error && (
        <div className="text-muted">
          Click "Connect WhatsApp" to get started
        </div>
      )}
    </div>
  );
};

export default WhatsAppConnect;

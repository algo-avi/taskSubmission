"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Alert,
  IconButton,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";

// ✅ Dynamically use BASE_URL from environment variable
const BASE_URL = import.meta.env.REACT_APP_BASE_URL || "http://localhost:5000/api";

const AgentManagement = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    countryCode: "+1",
    password: "",
  });

  const countryCodes = [
    { code: "+1", country: "US/Canada" },
    { code: "+44", country: "UK" },
    { code: "+91", country: "India" },
    { code: "+86", country: "China" },
    { code: "+49", country: "Germany" },
    { code: "+33", country: "France" },
    { code: "+81", country: "Japan" },
    { code: "+61", country: "Australia" },
  ];

  // ✅ Fetch agents list
  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/agents`);
      const fetchedAgents = response.data?.agents || [];
      setAgents(fetchedAgents); // ✅ Always an array
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch agents");
      setAgents([]); // ✅ Ensure safe fallback
    } finally {
      setLoading(false);
    }
  };

  // ✅ Create new agent
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await axios.post(`${BASE_URL}/agents`, formData);
      setSuccess("Agent created successfully!");
      setFormData({ name: "", email: "", mobile: "", countryCode: "+1", password: "" });
      setShowModal(false);
      fetchAgents(); // ✅ Refresh agent list
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create agent");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Delete agent
  const handleDelete = async (agentId) => {
    if (!window.confirm("Are you sure you want to delete this agent?")) return;
    try {
      await axios.delete(`${BASE_URL}/agents/${agentId}`);
      setSuccess("Agent deleted successfully!");
      fetchAgents();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete agent");
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader
          title="Agent Management"
          subheader="Manage your agents and their information"
          action={
            <Button variant="contained" onClick={() => setShowModal(true)}>
              ➕ Add Agent
            </Button>
          }
        />
        <CardContent>
          {error && <Alert severity="error" className="mb-4">{error}</Alert>}
          {success && <Alert severity="success" className="mb-4">{success}</Alert>}

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <CircularProgress />
            </div>
          ) : (
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead className="bg-slate-100">
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Mobile</TableCell>
                    <TableCell>Created At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {agents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No agents found. Create your first agent to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    agents.map((agent) => (
                      <TableRow key={agent._id}>
                        <TableCell className="font-medium">{agent.name}</TableCell>
                        <TableCell>{agent.email}</TableCell>
                        <TableCell>{agent.countryCode} {agent.mobile}</TableCell>
                        <TableCell>{new Date(agent.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <IconButton color="error" onClick={() => handleDelete(agent._id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add Agent Modal */}
      <Dialog open={showModal} onClose={() => setShowModal(false)} fullWidth maxWidth="sm">
        <DialogTitle className="flex justify-between items-center">
          <span>Add New Agent</span>
          <IconButton onClick={() => setShowModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <TextField label="Name" name="name" fullWidth required value={formData.name} onChange={handleInputChange} />
            <TextField label="Email" name="email" type="email" fullWidth required value={formData.email} onChange={handleInputChange} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select name="countryCode" fullWidth value={formData.countryCode} onChange={handleInputChange}>
                {countryCodes.map((c) => (
                  <MenuItem key={c.code} value={c.code}>
                    {c.code} ({c.country})
                  </MenuItem>
                ))}
              </Select>
              <TextField label="Mobile Number" name="mobile" fullWidth required value={formData.mobile} onChange={handleInputChange} />
            </div>
            <TextField label="Password" name="password" type="password" fullWidth required value={formData.password} onChange={handleInputChange} />
            <DialogActions className="px-0">
              <Button onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? "Creating..." : "Create Agent"}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentManagement;

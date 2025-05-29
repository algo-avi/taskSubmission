"use client"

import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import AgentManagement from "./AgentManagement"
import FileUpload from "./FileUpload"
import DistributionView from "./DistributionView"
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Tabs,
  Tab,
  Container,
  Box,
  Paper,
} from "@mui/material"

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("agents")
  const { logout } = useAuth()

  const handleLogout = async () => {
    await logout()
  }

  const tabIndex = {
    agents: 0,
    upload: 1,
    distribution: 2,
  }

  const tabValue = Object.keys(tabIndex).find((key) => tabIndex[key] === activeTab)

  return (
    <Box className="min-h-screen bg-gray-50">
      <AppBar position="sticky" color="inherit" elevation={1}>
        <Toolbar className="flex justify-between max-w-screen-xl mx-auto w-full px-4">
          <Typography
            variant="h6"
            className="font-bold text-gray-900"
          >
            Admin Dashboard
          </Typography>


          <Button onClick={handleLogout} variant="outlined" size="small">
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" className="py-8">
        <Paper elevation={3} className="rounded-xl mb-6">
          <Tabs
            value={tabIndex[activeTab]}
            onChange={(_, newValue) =>
              setActiveTab(Object.keys(tabIndex)[newValue])
            }
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            className="rounded-t-xl"
          >
            <Tab icon={<span>👥</span>} label="Agents" />
            <Tab icon={<span>📁</span>} label="Upload Lists" />
            <Tab icon={<span>📊</span>} label="Distribution" />
          </Tabs>
        </Paper>

        <Box className="animate-fade-in min-h-[400px]">
          {activeTab === "agents" && <AgentManagement />}
          {activeTab === "upload" && <FileUpload />}
          {activeTab === "distribution" && <DistributionView />}
        </Box>
      </Container>
    </Box>
  )
}

export default Dashboard

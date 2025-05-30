import { useState, useEffect } from "react"
import axios from "axios"
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Grid,
  Chip,
} from "@mui/material"

const DistributionView = () => {
  const [distributions, setDistributions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDistributions()
    // eslint-disable-next-line
  }, [])

const BASE_URL = import.meta.env.REACT_APP_BASE_URL || "http://localhost:5000"

  const fetchDistributions = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/distributions`)
      setDistributions(response.data.distributions)
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch distributions")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <CircularProgress />
      </div>
    )
  }

  const totalAgents = new Set(distributions.map((d) => d.agentId?._id)).size
  const totalRecords = distributions.reduce((sum, d) => sum + d.records.length, 0)
  const lastUpload =
    distributions.length > 0 ? new Date(Math.max(...distributions.map((d) => new Date(d.uploadDate).getTime()))) : null

  return (
    <div className="p-6">
      <Card className="w-full max-w-none backdrop-blur-md bg-white/30 border border-white/20 shadow-lg rounded-xl">

        <CardHeader title="Distribution Overview" subheader="View how tasks are distributed among agents" />
        <CardContent>
          {error && <Alert severity="error">{error}</Alert>}

          {distributions.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed rounded-lg bg-slate-50 text-slate-500">
              <div className="text-5xl mb-4">📄</div>
              <Typography variant="h6">No distributions found</Typography>
              <Typography>Upload a file to see task distributions here.</Typography>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Summary Cards */}
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Card>
                    <CardContent className="flex items-center gap-4">
                      <div className="text-3xl">👥</div>
                      <div>
                        <Typography variant="caption" color="textSecondary">
                          Total Agents
                        </Typography>
                        <Typography variant="h5">{totalAgents}</Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card className="w-full max-w-none backdrop-blur-md bg-white/30 border border-white/20 shadow-lg rounded-xl">

                    <CardContent className="flex items-center gap-4">
                      <div className="text-3xl">📄</div>
                      <div>
                        <Typography variant="caption" color="textSecondary">
                          Total Records
                        </Typography>
                        <Typography variant="h5">{totalRecords}</Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card className="w-full max-w-none backdrop-blur-md bg-white/30 border border-white/20 shadow-lg rounded-xl">

                    <CardContent className="flex items-center gap-4">
                      <div className="text-3xl">📅</div>
                      <div>
                        <Typography variant="caption" color="textSecondary">
                          Last Upload
                        </Typography>
                        <Typography variant="h5">
                          {lastUpload ? lastUpload.toLocaleDateString() : "N/A"}
                        </Typography>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Distribution Table */}
              <TableContainer component={Paper} className="rounded-lg shadow">
                <Table size="small">
                  <TableHead className="bg-slate-100">
                    <TableRow>
                      <TableCell>Agent</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Records Count</TableCell>
                      <TableCell>File Name</TableCell>
                      <TableCell>Upload Date</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {distributions.map((d) => (
                      <TableRow key={d._id}>
                        <TableCell>{d.agentId?.name || "N/A"}</TableCell>
                        <TableCell>{d.agentId?.email || "N/A"}</TableCell>
                        <TableCell>
                          <Chip label={`${d.records.length} records`} color="primary" size="small" />
                        </TableCell>
                        <TableCell>{d.fileName}</TableCell>
                        <TableCell>{new Date(d.uploadDate).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Chip label="Distributed" color="success" size="small" />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Detailed Records */}
              <div>
                <Typography variant="h6" className="mb-4">
                  Detailed Records by Agent
                </Typography>

                {distributions.map((d) => (
                  <Card key={d._id} className="mb-4">
                    <CardHeader
                      title={`${d.agentId?.name || "N/A"} - ${d.records.length} Records`}
                      subheader={`From ${d.fileName} uploaded on ${new Date(d.uploadDate).toLocaleDateString()}`}
                    />
                    <CardContent>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>First Name</TableCell>
                              <TableCell>Phone</TableCell>
                              <TableCell>Notes</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {d.records.map((record, index) => (
                              <TableRow key={index}>
                                <TableCell>{record.firstName}</TableCell>
                                <TableCell>{record.phone}</TableCell>
                                <TableCell className="max-w-xs truncate hover:whitespace-normal">
                                  {record.notes}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DistributionView

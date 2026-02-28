import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-memory store for demo purposes
  let boltTokens: any = null;

  // Helper to get Bolt Token using client_credentials
  async function getBoltToken() {
    const clientId = process.env.BOLT_CLIENT_ID;
    const clientSecret = process.env.BOLT_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error("Bolt credentials not configured");
    }

    try {
      const params = new URLSearchParams();
      params.append('client_id', clientId);
      params.append('client_secret', clientSecret);
      params.append('grant_type', 'client_credentials');
      params.append('scope', 'fleet-integration:api');

      const response = await axios.post("https://oidc.bolt.eu/token", params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      boltTokens = response.data;
      return boltTokens.access_token;
    } catch (error: any) {
      console.error("Bolt Token Error:", error.response?.data || error.message);
      throw new Error("Falha ao obter token da Bolt");
    }
  }

  // API to fetch all Bolt data
  app.get("/api/bolt/sync", async (req, res) => {
    const clientId = process.env.BOLT_CLIENT_ID;
    const clientSecret = process.env.BOLT_CLIENT_SECRET;

    // If credentials are not configured, return mock data for demo purposes
    if (!clientId || !clientSecret) {
      console.log("Bolt credentials not configured. Returning mock data.");
      return res.json({
        drivers: [
          { id: 'mock-1', name: 'João Silva (Bolt)', email: 'joao.bolt@example.com', phone: '912345678', tax_id: '123456789' },
          { id: 'mock-2', name: 'Maria Santos (Bolt)', email: 'maria.bolt@example.com', phone: '912345679', tax_id: '987654321' }
        ],
        vehicles: [
          { id: 'mock-v1', plate_number: 'AA-00-BB', make: 'Toyota', model: 'Corolla', year: 2022 },
          { id: 'mock-v2', plate_number: 'CC-11-DD', make: 'Renault', model: 'Zoe', year: 2023 }
        ],
        earnings: [
          { id: 'mock-e1', driver_name: 'João Silva (Bolt)', amount: '450.50', date: new Date().toISOString().split('T')[0], period: 'Semana Atual' },
          { id: 'mock-e2', driver_name: 'Maria Santos (Bolt)', amount: '580.20', date: new Date().toISOString().split('T')[0], period: 'Semana Atual' }
        ],
        isMock: true,
        timestamp: new Date().toISOString()
      });
    }

    try {
      const accessToken = await getBoltToken();
      
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      // Fetch consolidated data from Bolt
      // Using the correct Fleet Integration API endpoints
      console.log("Fetching drivers from Bolt...");
      const driversRes = await axios.get("https://api.bolt.eu/fleet-integration/v1/drivers", { headers })
        .catch(err => {
          console.error("Drivers Fetch Error:", err.response?.data || err.message);
          return { data: { drivers: [] } };
        });

      console.log("Fetching vehicles from Bolt...");
      const vehiclesRes = await axios.get("https://api.bolt.eu/fleet-integration/v1/vehicles", { headers })
        .catch(err => {
          console.error("Vehicles Fetch Error:", err.response?.data || err.message);
          return { data: { vehicles: [] } };
        });

      console.log("Fetching earnings from Bolt...");
      // For earnings, we might need to specify a date range
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const startDate = thirtyDaysAgo.toISOString().split('T')[0];

      const earningsRes = await axios.get(`https://api.bolt.eu/fleet-integration/v1/earnings?start_date=${startDate}&end_date=${today}`, { headers })
        .catch(err => {
          console.error("Earnings Fetch Error:", err.response?.data || err.message);
          return { data: { earnings: [] } };
        });

      console.log(`Sync complete. Drivers: ${driversRes.data.drivers?.length || 0}, Vehicles: ${vehiclesRes.data.vehicles?.length || 0}, Earnings: ${earningsRes.data.earnings?.length || 0}`);

      res.json({
        drivers: driversRes.data.drivers || [],
        vehicles: vehiclesRes.data.vehicles || [],
        earnings: earningsRes.data.earnings || [],
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Bolt Sync Error:", error.message);
      res.status(500).json({ error: error.message || "Erro ao sincronizar dados com a Bolt." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

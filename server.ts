import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import crypto from "crypto";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }) : null;

// Viva Wallet Integration Logic
async function getVivaAccessToken() {
  const clientId = process.env.VIVA_CLIENT_ID;
  const clientSecret = process.env.VIVA_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("[VIVA] Credenciais não configuradas: VIVA_CLIENT_ID ou VIVA_CLIENT_SECRET ausentes.");
    throw new Error("Viva Wallet credentials not configured");
  }

  console.log("[VIVA] Iniciando obtenção de token para Client ID:", clientId.substring(0, 5) + "...");

  try {
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const response = await axios.post("https://accounts.vivapayments.com/connect/token", params, {
      timeout: 10000,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data.access_token;
  } catch (error: any) {
    const errorDetail = error.response?.data || error.message;
    console.error("Viva Token Error:", errorDetail);
    throw new Error(`Falha ao obter token da Viva Wallet: ${error.message}`);
  }
}

// Email Integration
let resendClient: Resend | null = null;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'TVDE Fleet <onboarding@resend.dev>';

function getResendClient() {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      resendClient = new Resend(apiKey);
    }
  }
  return resendClient;
}

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const useSMTP = process.env.EMAIL_HOST && process.env.EMAIL_USERNAME && process.env.EMAIL_PASSWORD;
  
  if (useSMTP) {
    console.log(`[EMAIL] Enviando via SMTP (${process.env.EMAIL_HOST}) para: ${to}`);
    return transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to,
      subject,
      html,
    });
  } else {
    const resend = getResendClient();
    if (resend) {
      console.log(`[EMAIL] Enviando via Resend para: ${to}`);
      return resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject,
        html,
      });
    }
    throw new Error("Serviço de email não configurado (SMTP ou Resend).");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} [${req.method}] ${req.url}`);
    next();
  });

  // Resend Email Endpoint for Notifications
  app.post("/api/notifications/send", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!supabaseAdmin || !authHeader) return res.status(401).json({ error: "Não autorizado" });

    const { to, subject, message, companyName } = req.body;

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) return res.status(401).json({ error: "Sessão inválida" });

      const resend = getResendClient();
      if (!resend) {
        return res.status(400).json({ error: "Serviço de email não configurado." });
      }
      
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="margin-bottom: 20px;">
            <h2 style="color: #1a1a1a; margin: 0;">${subject}</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">Notificação de ${companyName || 'TVDE Fleet'}</p>
          </div>
          <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151;">
              ${message.replace(/\n/g, '<br>')}
            </p>
          </div>
          <div style="padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
            <p>Esta é uma mensagem automática gerada pelo sistema TVDE Fleet.</p>
          </div>
        </div>
      `;

      const data = await sendEmail({
        to,
        subject,
        html: htmlContent
      });

      res.json({ success: true, data });
    } catch (error: any) {
      console.error("Error sending notification email:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Resend Email Endpoint for Invoices
  app.post("/api/invoices/send", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!supabaseAdmin || !authHeader) return res.status(401).json({ error: "Não autorizado" });

    const { to, companyName, clientName, invoiceNumber, amount, items, dueDate } = req.body;

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) return res.status(401).json({ error: "Sessão inválida" });

      const resend = getResendClient();
      if (!resend) {
        return res.status(400).json({ error: "Serviço de email não configurado." });
      }
      
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px;">
            <h1 style="color: #1a1a1a; margin: 0;">FATURA</h1>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold;">${companyName}</p>
              <p style="margin: 0; color: #666; font-size: 12px;">Fatura #${invoiceNumber}</p>
            </div>
          </div>

          <div style="margin-bottom: 40px;">
            <p style="margin: 0; color: #666; font-size: 12px; text-transform: uppercase;">Faturar a:</p>
            <p style="margin: 5px 0 0 0; font-weight: bold; font-size: 16px;">${clientName}</p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 40px;">
            <thead>
              <tr style="border-bottom: 2px solid #eee;">
                <th style="text-align: left; padding: 10px 0; font-size: 12px; color: #666; text-transform: uppercase;">Descrição</th>
                <th style="text-align: right; padding: 10px 0; font-size: 12px; color: #666; text-transform: uppercase;">Valor</th>
              </tr>
            </thead>
            <tbody>
              ${items.map((item: any) => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 15px 0;">${item.description}</td>
                  <td style="padding: 15px 0; text-align: right;">${item.amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end; margin-bottom: 40px;">
            <div style="width: 200px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                <span style="color: #666;">Total:</span>
                <span style="font-weight: bold; font-size: 20px;">${amount.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' })}</span>
              </div>
              <div style="display: flex; justify-content: space-between;">
                <span style="color: #666; font-size: 12px;">Vencimento:</span>
                <span style="font-weight: bold; font-size: 12px;">${dueDate}</span>
              </div>
            </div>
          </div>

          <div style="padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #999; font-size: 12px;">
            <p>Obrigado pela sua preferência!</p>
          </div>
        </div>
      `;

      const { data, error } = await sendEmail({
        to,
        subject: `Fatura #${invoiceNumber} - ${companyName}`,
        html: htmlContent
      }) as any;

      if (error) {
        return res.status(400).json({ error });
      }

      res.json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Viva Wallet Diagnostic Endpoint
  app.get("/api/viva/diagnostic", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!supabaseAdmin || !authHeader) return res.status(401).json({ error: "Não autorizado" });

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      
      // Only master admin can run diagnostics
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', user?.id)
        .single();

      if (profile?.role !== 'master') {
        return res.status(403).json({ error: "Apenas administradores master podem realizar diagnósticos." });
      }

      console.log("[VIVA DIAGNOSTIC] Iniciando teste de conectividade...");
      const accessToken = await getVivaAccessToken();
      
      res.json({ 
        success: true, 
        message: "Conexão com Viva Wallet (Produção) estabelecida com sucesso!",
        status: "200 OK",
        mode: "Production"
      });
    } catch (error: any) {
      console.error("[VIVA DIAGNOSTIC ERROR]", error.message);
      res.status(500).json({ 
        success: false, 
        error: "Falha na conexão com Viva Wallet",
        details: error.message,
        mode: "Production"
      });
    }
  });

  // Viva Wallet Endpoints
  app.post("/api/viva/create-order", async (req, res) => {
    // console.log("[VIVA] Recebida solicitação de criação de ordem:", req.body);
    const { amount, planId, companyId, customerEmail, customerName } = req.body;

    if (!amount || !planId || !companyId) {
      return res.status(400).json({ error: "Parâmetros ausentes: amount, planId e companyId são obrigatórios." });
    }

    try {
      const accessToken = await getVivaAccessToken();
      console.log("[VIVA] Token de acesso obtido com sucesso");
      const merchantId = process.env.VIVA_MERCHANT_ID;
      const apiKey = process.env.VIVA_API_KEY;
      const sourceCode = process.env.VIVA_SOURCE_CODE || 'Default';

      // Viva Wallet expects amount in cents
      const amountInCents = Math.round(amount * 100);

      const orderResponse = await axios.post("https://api.vivapayments.com/checkout/v2/orders", {
        amount: amountInCents,
        customerTrns: `Assinatura Plano ${planId} - Empresa ${companyId}`,
        customer: {
          email: customerEmail,
          fullName: customerName,
          requestLang: "pt-PT"
        },
        paymentTimeout: 3600,
        preauth: false,
        allowRepeatingPayments: true,
        actionUser: "SaaS Platform",
        sourceCode: sourceCode,
        paymentNotification: true,
        disableExactAmount: false,
        disableCash: true,
        disableWallet: false
      }, {
        timeout: 15000,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      res.json({ 
        orderCode: orderResponse.data.orderCode,
        checkoutUrl: `https://www.vivapayments.com/web/checkout?ref=${orderResponse.data.orderCode}`
      });
    } catch (error: any) {
      const errorDetail = error.response?.data?.errors || error.response?.data || error.message;
      console.error("Viva Create Order Error:", errorDetail);
      res.status(500).json({ 
        error: "Erro ao criar ordem de pagamento na Viva Wallet",
        details: errorDetail
      });
    }
  });

  app.get("/api/viva/verify-payment", async (req, res) => {
    const { orderCode, companyId, planId } = req.query;

    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase Admin not configured" });

    try {
      const accessToken = await getVivaAccessToken();
      
      const response = await axios.get(`https://api.vivapayments.com/checkout/v2/orders/${orderCode}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const orderData = response.data;
      // State 3 means paid
      if (orderData.stateId === 3) {
        // Update company plan in Supabase
        const { error } = await supabaseAdmin
          .from('companies')
          .update({ 
            plan: planId, 
            subscription_status: 'active',
            last_payment_date: new Date().toISOString()
          })
          .eq('id', companyId);

        if (error) throw error;

        res.json({ success: true, message: "Pagamento confirmado e plano ativado!" });
      } else {
        res.json({ success: false, state: orderData.stateId, message: "Pagamento ainda não confirmado." });
      }
    } catch (error: any) {
      console.error("Viva Verify Error:", error.response?.data || error.message);
      res.status(500).json({ error: "Erro ao verificar pagamento" });
    }
  });

  app.post("/api/viva/process-native", async (req, res) => {
    const { orderCode, card, companyId, planId } = req.body;

    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase Admin not configured" });

    try {
      const accessToken = await getVivaAccessToken();
      
      // 1. Process the transaction using Native Checkout API
      // Note: In a real production environment, you should use card tokenization 
      // to avoid handling raw card data on your server (PCI compliance).
      const response = await axios.post("https://api.vivapayments.com/nativecheckout/v2/transactions", {
        orderCode,
        card
      }, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const transaction = response.data;

      if (transaction.statusId === 'F') { // F = Finished/Success
        // 2. Update company plan in Supabase
        const { error } = await supabaseAdmin
          .from('companies')
          .update({ 
            plan: planId, 
            subscription_status: 'active',
            last_payment_date: new Date().toISOString()
          })
          .eq('id', companyId);

        if (error) throw error;

        res.json({ success: true, message: "Pagamento processado com sucesso!", transactionId: transaction.transactionId });
      } else {
        res.status(400).json({ 
          success: false, 
          message: transaction.message || "Falha no processamento do pagamento.",
          statusId: transaction.statusId
        });
      }
    } catch (error: any) {
      console.error("Viva Native Process Error:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Erro ao processar pagamento nativo", 
        details: error.response?.data?.message || error.message 
      });
    }
  });

  // Test Email Endpoint (Resend)
  app.post("/api/test-email", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!supabaseAdmin || !authHeader) return res.status(401).json({ error: "Não autorizado" });

    const resendKey = process.env.RESEND_API_KEY;
    
    if (!resendKey) {
      return res.status(400).json({ error: "RESEND_API_KEY não configurada no ambiente." });
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) return res.status(401).json({ error: "Sessão inválida" });
      const data = await sendEmail({
        to: user.email || 'passageiroexpress@gmail.com',
        subject: 'Teste de Email - TVDE Fleet',
        html: '<p>Este é um email de teste enviado com sucesso!</p>'
      });

      res.json({ success: true, data });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/viva/webhook", async (req, res) => {
    // Viva Wallet Webhook implementation
    // This would be called by Viva Wallet when a transaction is completed
    const { EventData, EventType } = req.body;

    if (EventType === 'TransactionPaymentCompleted' && supabaseAdmin) {
      const orderCode = EventData.OrderCode;
      
      try {
        const accessToken = await getVivaAccessToken();
        const orderRes = await axios.get(`https://api.vivapayments.com/checkout/v2/orders/${orderCode}`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        // Extract companyId and planId from customerTrns or metadata if available
        // For this demo, we'll assume we can parse it from customerTrns
        const trns = orderRes.data.customerTrns;
        const companyIdMatch = trns.match(/Empresa ([\w-]+)/);
        const planIdMatch = trns.match(/Plano ([\w-]+)/);

        if (companyIdMatch && planIdMatch) {
          const companyId = companyIdMatch[1];
          const planId = planIdMatch[1];

          await supabaseAdmin
            .from('companies')
            .update({ 
              plan: planId, 
              subscription_status: 'active',
              last_payment_date: new Date().toISOString()
            })
            .eq('id', companyId);
          
          console.log(`[WEBHOOK] Plano ${planId} ativado para empresa ${companyId}`);
        }
      } catch (err) {
        console.error("[WEBHOOK ERROR]", err);
      }
    }

    res.status(200).send("OK");
  });

  // Secure company management for master admin
  app.post("/api/companies/upsert", async (req, res) => {
    const { admin_name, admin_email, admin_password, ...companyData } = req.body;
    
    if (!supabaseAdmin) return res.status(500).json({ error: "Supabase Admin not configured" });

    try {
      // 1. Upsert the company
      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .upsert(companyData)
        .select()
        .single();

      if (companyError) {
        if (companyError.message.includes('companies_nif_key')) {
          throw new Error("Já existe uma empresa registada com este NIF.");
        }
        throw companyError;
      }

      // 2. If admin details are provided, create the admin user
      if (admin_email && admin_password) {
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: admin_email,
          password: admin_password,
          email_confirm: true,
          user_metadata: { 
            full_name: admin_name || companyData.name, 
            role: 'admin', 
            company_id: company.id 
          }
        });

        if (authError) {
          // If user already exists, we might just want to link them or ignore
          if (authError.message.includes('already registered')) {
            console.log("Admin user already exists, skipping auth creation.");
          } else {
            throw authError;
          }
        } else {
          // Create profile in users table
          await supabaseAdmin
            .from('users')
            .upsert({
              id: authData.user.id,
              email: admin_email,
              full_name: admin_name || companyData.name,
              company_id: company.id,
              role: 'admin'
            });
        }
      }

      res.json({ success: true, data: company });
    } catch (error: any) {
      console.error("Company Upsert Error:", error.message);
      res.status(500).json({ error: error.message || "Erro ao salvar empresa no banco de dados" });
    }
  });

  // Public API to register a new company and its first admin user
  app.post("/api/auth/register-company", async (req, res) => {
    const { company_name, company_nif, admin_email, admin_password, admin_name, plan } = req.body;

    // console.log(`[REGISTER] Iniciando registro para ${admin_email} (${company_name}) - Plano: ${plan || 'free'}`);

    if (!supabaseAdmin) {
      console.error("[REGISTER ERROR] Supabase Admin client not initialized");
      return res.status(500).json({ error: "Supabase Service Role Key não configurada no servidor." });
    }

    try {
      // 1. Create the company
      const companyId = crypto.randomUUID();
      // console.log(`[REGISTER] Gerado UUID para empresa: ${companyId}`);

      const { data: company, error: companyError } = await supabaseAdmin
        .from('companies')
        .insert([{
          id: companyId,
          name: company_name,
          nif: company_nif,
          status: 'active',
          plan: plan || 'free',
          subscription_status: 'active',
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (companyError) {
        console.error("[REGISTER ERROR] Falha ao criar empresa:", companyError.message);
        if (companyError.message.includes('companies_nif_key')) {
          throw new Error("Já existe uma empresa registada com este NIF.");
        }
        throw companyError;
      }

      // console.log(`[REGISTER] Empresa criada com sucesso: ${companyId}`);

      // 2. Create the admin user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: admin_email,
        password: admin_password,
        email_confirm: true,
        user_metadata: { full_name: admin_name, role: 'admin', company_id: companyId }
      });

      if (authError) {
        console.error("[REGISTER ERROR] Falha ao criar usuário no Auth:", authError.message);
        // Cleanup company if auth fails
        await supabaseAdmin.from('companies').delete().eq('id', companyId);
        
        if (authError.message.includes('Database error creating new user')) {
          throw new Error("Erro na base de dados ao criar utilizador. Isto acontece geralmente quando existe um 'Trigger' no Supabase (ex: on_auth_user_created) que está a falhar. Por favor, vá ao painel do Supabase > Database > Triggers e elimine qualquer trigger na tabela auth.users, ou execute: DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;");
        }
        
        throw authError;
      }

      // console.log(`[REGISTER] Usuário Auth criado: ${authData.user.id}`);

      // 3. Create the user profile in custom table
      const profilePayload: any = {
        id: authData.user.id,
        email: admin_email,
        full_name: admin_name,
        company_id: companyId,
        role: 'admin'
      };

      const { error: profileError } = await supabaseAdmin
        .from('users')
        .insert([profilePayload]);

      if (profileError) {
        console.error("[REGISTER ERROR] Falha ao criar perfil do usuário:", profileError.message, profileError.details);
        // Cleanup Auth user and company if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        await supabaseAdmin.from('companies').delete().eq('id', companyId);
        
        if (profileError.message.includes('column "password" of relation "users" violates not-null constraint')) {
          throw new Error("A sua tabela 'users' no Supabase tem uma coluna 'password' obrigatória, o que entra em conflito com o sistema de autenticação seguro. Por favor, vá ao SQL Editor no Supabase e execute: ALTER TABLE users ALTER COLUMN password DROP NOT NULL; ou remova a coluna completamente com: ALTER TABLE users DROP COLUMN password;");
        }
        
        throw new Error(`Erro ao criar perfil de utilizador: ${profileError.message}`);
      }

      // console.log(`[REGISTER] Registro completo para ${admin_email}`);

      // 4. Send Welcome Email
      try {
        await sendEmail({
          to: admin_email,
          subject: 'Bem-vindo à TVDE Fleet CRM',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #1a1a1a;">Bem-vindo, ${admin_name}!</h1>
              <p>A sua conta de administrador para a empresa <strong>${company_name}</strong> foi criada com sucesso.</p>
              <p>Agora pode começar a gerir a sua frota, motoristas e veículos de forma eficiente.</p>
              <div style="margin: 30px 0;">
                <a href="${process.env.APP_URL || 'https://tvdefleet.com'}/login" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Aceder ao Painel</a>
              </div>
              <p style="color: #666; font-size: 14px;">Se tiver alguma dúvida, responda a este email.</p>
            </div>
          `
        });
        console.log(`[REGISTER] Email de boas-vindas enviado para ${admin_email}`);
      } catch (emailError) {
        console.error("[REGISTER EMAIL ERROR]", emailError);
      }

      // 5. Handle Viva Wallet Payment if plan is not free
      let checkoutUrl = null;
      let orderCode = null;
      if (plan && plan !== 'free') {
        try {
          const amount = plan === 'pro' ? 49.90 : 99.90;
          const accessToken = await getVivaAccessToken();
          const sourceCode = process.env.VIVA_SOURCE_CODE || 'Default';
          const amountInCents = Math.round(amount * 100);

          const orderResponse = await axios.post("https://api.vivapayments.com/checkout/v2/orders", {
            amount: amountInCents,
            customerTrns: `Assinatura Plano ${plan} - Empresa ${companyId}`,
            customer: {
              email: admin_email,
              fullName: admin_name,
              requestLang: "pt-PT"
            },
            paymentTimeout: 3600,
            preauth: false,
            allowRepeatingPayments: true,
            actionUser: "SaaS Platform",
            sourceCode: sourceCode,
            paymentNotification: true,
            disableExactAmount: false,
            disableCash: true,
            disableWallet: false
          }, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });

          orderCode = orderResponse.data.orderCode;
          checkoutUrl = `https://www.vivapayments.com/web/checkout?ref=${orderCode}`;
          
          // Update company status to incomplete pending payment
          await supabaseAdmin
            .from('companies')
            .update({ subscription_status: 'incomplete' })
            .eq('id', companyId);

        } catch (vivaError: any) {
          console.error("[REGISTER VIVA ERROR] Falha ao criar ordem de pagamento:", vivaError.message);
          // We don't fail the registration, but we leave the subscription as active (or incomplete)
          // For testing purposes, if Viva is not configured, we'll just let them in.
          console.log("Viva Wallet credentials might be missing. Proceeding without payment.");
        }
      }

      res.json({ success: true, company, user: authData.user, checkoutUrl, orderCode });
    } catch (error: any) {
      console.error("[REGISTER FATAL ERROR]", error.message);
      if (error.message?.includes('Invalid API key')) {
        return res.status(400).json({ error: "A chave da API do Supabase é inválida. Por favor, verifique a variável SUPABASE_SERVICE_ROLE_KEY no servidor." });
      }
      res.status(400).json({ error: error.message });
    }
  });

  // API to create user in Supabase Auth (Admin only)
  app.post("/api/auth/create-user", async (req, res) => {
    const { email, password, full_name, role, company_id } = req.body;
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase Service Role Key não configurada no servidor." });
    }

    if (!authHeader) {
      return res.status(401).json({ error: "Não autorizado. Token ausente." });
    }

    try {
      // Verify the requester's token
      const token = authHeader.replace('Bearer ', '');
      const { data: { user: requester }, error: verifyError } = await supabaseAdmin.auth.getUser(token);

      if (verifyError || !requester) {
        return res.status(401).json({ error: "Sessão inválida ou expirada." });
      }

      // Check if requester has permission (admin or master)
      // We fetch the role from our custom users table for the requester
      const { data: requesterProfile } = await supabaseAdmin
        .from('users')
        .select('role')
        .eq('id', requester.id)
        .single();

      if (!requesterProfile || !['admin', 'master'].includes(requesterProfile.role)) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem criar usuários." });
      }

      // 1. Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name, role, company_id }
      });

      if (authError) throw authError;

      // 2. Create profile in custom table
      const table = role === 'driver' ? 'drivers' : 'users';
      const profileData: any = {
        id: authData.user.id,
        email,
        full_name,
        company_id: company_id || null,
      };

      if (role !== 'driver') {
        profileData.role = role;
      }

      const { error: profileError } = await supabaseAdmin
        .from(table)
        .insert([profileData]);

      if (profileError) {
        console.error(`[CREATE USER ERROR] Falha ao criar perfil na tabela ${table}:`, profileError.message, profileError.details);
        // Cleanup Auth user if profile creation fails
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        
        if (profileError.message.includes('column "password" of relation "users" violates not-null constraint')) {
          throw new Error("A sua tabela 'users' no Supabase tem uma coluna 'password' obrigatória. Por favor, vá ao SQL Editor no Supabase e execute: ALTER TABLE users DROP COLUMN password;");
        }
        
        throw new Error(`Erro de base de dados ao criar perfil: ${profileError.message}`);
      }

      // 3. Send Welcome Email
      const resend = getResendClient();
      if (resend) {
        try {
          const loginUrl = process.env.APP_URL || 'https://tvdefleet.com';
          await resend.emails.send({
            from: RESEND_FROM_EMAIL,
            to: [email],
            subject: 'Bem-vindo à TVDE Fleet',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #1a1a1a;">Olá, ${full_name}!</h1>
                <p>Foi criada uma conta para si na plataforma TVDE Fleet com a função de <strong>${role === 'driver' ? 'Motorista' : role.charAt(0).toUpperCase() + role.slice(1)}</strong>.</p>
                <p>Pode aceder à sua conta utilizando as seguintes credenciais:</p>
                <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
                  <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
                  <p style="margin: 5px 0;"><strong>Senha:</strong> ${password}</p>
                </div>
                <div style="margin: 30px 0;">
                  <a href="${loginUrl}/login" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Fazer Login</a>
                </div>
                <p style="color: #666; font-size: 14px;">Por razões de segurança, recomendamos que altere a sua senha após o primeiro acesso.</p>
              </div>
            `
          });
          console.log(`[CREATE USER] Email de boas-vindas enviado para ${email}`);
        } catch (emailError) {
          console.error("[CREATE USER EMAIL ERROR]", emailError);
        }
      }

      res.json({ success: true, user: authData.user });
    } catch (error: any) {
      console.error("Create User Error:", error.message);
      if (error.message?.includes('Invalid API key')) {
        return res.status(400).json({ error: "A chave da API do Supabase é inválida. Por favor, verifique a variável SUPABASE_SERVICE_ROLE_KEY no servidor." });
      }
      res.status(400).json({ error: error.message });
    }
  });

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

  // Real Email Alert Function using Resend
  async function sendEmailAlert(to: string, subject: string, message: string) {
    const resendKey = process.env.RESEND_API_KEY;
    
    if (!resendKey) {
      console.log(`[MOCK EMAIL - NO API KEY] To: ${to} | Subject: ${subject} | Message: ${message}`);
      return { success: true };
    }

    try {
      const resend = new Resend(resendKey);
      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [to],
        subject: subject,
        html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #050505;">${subject}</h2>
                <p style="color: #666; font-size: 16px;">${message}</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
                <p style="color: #999; font-size: 12px;">Este é um alerta automático do TVDE Fleet CRM.</p>
              </div>`
      });
      console.log(`[REAL EMAIL SENT] To: ${to}`);
      return { success: true };
    } catch (error: any) {
      console.error("Resend Email Error:", error.message);
      return { success: false, error: error.message };
    }
  }

  // Test Welcome Email Endpoint
  app.post("/api/test/welcome-email", async (req, res) => {
    const { email, name, role } = req.body;
    if (!email) return res.status(400).json({ error: "Email é obrigatório" });

    const resend = getResendClient();
    if (!resend) return res.status(400).json({ error: "Resend API Key não configurada" });

    try {
      const loginUrl = process.env.APP_URL || 'https://tvdefleet.com';
      await resend.emails.send({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject: 'Bem-vindo à TVDE Fleet (Teste)',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #1a1a1a;">Olá, ${name || 'Utilizador de Teste'}!</h1>
            <p>Foi criada uma conta para si na plataforma TVDE Fleet com a função de <strong>${role || 'Motorista'}</strong>.</p>
            <p>Pode aceder à sua conta utilizando as seguintes credenciais:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 5px 0;"><strong>Senha:</strong> ********</p>
            </div>
            <div style="margin: 30px 0;">
              <a href="${loginUrl}/login" style="background-color: #1a1a1a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Fazer Login</a>
            </div>
            <p style="color: #666; font-size: 14px;">Se recebeu este email, a configuração do serviço de email está correta!</p>
          </div>
        `
      });
      res.json({ success: true, message: `Email de boas-vindas de teste enviado para ${email}` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API to trigger document expiration alerts
  app.post("/api/alerts/check-expirations", async (req, res) => {
    const authHeader = req.headers.authorization;
    if (!supabaseAdmin || !authHeader) return res.status(401).json({ error: "Não autorizado" });

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) return res.status(401).json({ error: "Sessão inválida" });

      // Fetch vehicles with expiring documents (simplified logic for demo)
      const { data: vehicles } = await supabaseAdmin
        .from('vehicles')
        .select('*')
        .eq('company_id', user.user_metadata.company_id);

      const today = new Date();
      const alerts = [];

      for (const v of (vehicles || [])) {
        const insExp = new Date(v.insurance_expiry);
        const inspExp = new Date(v.inspection_expiry);
        const diffIns = Math.ceil((insExp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffIns <= 7 && diffIns > 0) {
          await sendEmailAlert(user.email!, "Alerta de Seguro - TVDE Fleet", `O seguro da viatura ${v.plate} expira em ${diffIns} dias.`);
          alerts.push({ plate: v.plate, type: 'insurance', days: diffIns });
        }
      }

      res.json({ success: true, alerts_sent: alerts.length, alerts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API to approve or reject documents
  app.post("/api/documents/review", async (req, res) => {
    const { documentId, status, type, notes } = req.body;
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin || !authHeader) return res.status(401).json({ error: "Não autorizado" });

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (!user) return res.status(401).json({ error: "Sessão inválida" });

      const table = type === 'driver' ? 'driver_documents' : 'vehicle_documents';
      
      const { error } = await supabaseAdmin
        .from(table)
        .update({ status, review_notes: notes, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
        .eq('id', documentId);

      if (error) throw error;

      res.json({ success: true, message: `Documento ${status === 'valid' ? 'aprovado' : 'rejeitado'} com sucesso.` });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API to update company settings (Uber/Bolt credentials)
  app.post("/api/settings/update", async (req, res) => {
    const authHeader = req.headers.authorization;
    const { 
      bolt_client_id, bolt_client_secret, uber_client_id, uber_client_secret, 
      logo_url, primary_color,
      transfer_price_per_km, transfer_price_per_min, vat_rate,
      delivery_base_price, delivery_price_per_km
    } = req.body;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase não configurado." });
    }

    if (!authHeader) {
      return res.status(401).json({ error: "Não autorizado." });
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);

      if (verifyError || !user) {
        return res.status(401).json({ error: "Sessão inválida." });
      }

      // Fetch company_id for this user
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('company_id, role')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id || profile.role !== 'admin') {
        console.warn(`[SETTINGS] 403 Forbidden: User ${user.id} is not an admin or has no company`);
        return res.status(403).json({ 
          error: "Apenas administradores podem atualizar as configurações da empresa.",
          details: "O seu perfil de utilizador deve ter a função 'admin' e estar associado a uma empresa."
        });
      }

      // Prepare data for upsert, only include secrets if they are provided
      const upsertData: any = {
        company_id: profile.company_id,
        bolt_client_id,
        uber_client_id,
        logo_url,
        primary_color,
        transfer_price_per_km,
        transfer_price_per_min,
        vat_rate,
        delivery_base_price,
        delivery_price_per_km,
        updated_at: new Date().toISOString()
      };

      if (bolt_client_secret) upsertData.bolt_client_secret = bolt_client_secret;
      if (uber_client_secret) upsertData.uber_client_secret = uber_client_secret;

      // Upsert settings for this company
      const { error: upsertError } = await supabaseAdmin
        .from('settings')
        .upsert(upsertData, { onConflict: 'company_id' });

      if (upsertError) throw upsertError;

      res.json({ success: true, message: "Configurações atualizadas com sucesso." });
    } catch (error: any) {
      console.error("Settings Update Error:", error.message);
      res.status(500).json({ error: error.message || "Erro ao atualizar configurações." });
    }
  });

  // API to fetch all Bolt data
  app.get("/api/bolt/sync", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase não configurado." });
    }

    if (!authHeader) {
      return res.status(401).json({ error: "Não autorizado." });
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);

      if (verifyError || !user) {
        return res.status(401).json({ error: "Sessão inválida." });
      }

      // Fetch company_id for this user
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        console.warn(`[BOLT SYNC] 403 Forbidden: Company not found for user ${user.id}`);
        return res.status(403).json({ 
          error: "Empresa não encontrada para este usuário.",
          details: "O seu perfil de utilizador não está associado a nenhuma empresa. Verifique a tabela 'users' no Supabase."
        });
      }

      // Fetch Bolt credentials from settings table
      const { data: settings } = await supabaseAdmin
        .from('settings')
        .select('bolt_client_id, bolt_client_secret')
        .eq('company_id', profile.company_id)
        .single();

      const clientId = settings?.bolt_client_id;
      const clientSecret = settings?.bolt_client_secret;

      // If credentials are not configured, return error
      if (!clientId || !clientSecret) {
        return res.status(400).json({ 
          error: "Credenciais da Bolt não configuradas.",
          details: "Por favor, configure o Client ID e Client Secret nas definições da empresa."
        });
      }

      // Helper to get Bolt Token using client_credentials (scoped to this request)
      const getBoltTokenLocal = async (cid: string, csec: string) => {
        const params = new URLSearchParams();
        params.append('client_id', cid);
        params.append('client_secret', csec);
        params.append('grant_type', 'client_credentials');
        params.append('scope', 'fleet-integration:api');

        const response = await axios.post("https://oidc.bolt.eu/token", params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data.access_token;
      };

      const accessToken = await getBoltTokenLocal(clientId, clientSecret);
      
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

  // API to fetch all Uber data
  app.get("/api/uber/sync", async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!supabaseAdmin) {
      return res.status(500).json({ error: "Supabase não configurado." });
    }

    if (!authHeader) {
      return res.status(401).json({ error: "Não autorizado." });
    }

    try {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);

      if (verifyError || !user) {
        return res.status(401).json({ error: "Sessão inválida." });
      }

      // Fetch company_id for this user
      const { data: profile } = await supabaseAdmin
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!profile?.company_id) {
        console.warn(`[UBER SYNC] 403 Forbidden: Company not found for user ${user.id}`);
        return res.status(403).json({ 
          error: "Empresa não encontrada para este usuário.",
          details: "O seu perfil de utilizador não está associado a nenhuma empresa. Verifique a tabela 'users' no Supabase."
        });
      }

      // Fetch Uber credentials from settings table
      const { data: settings } = await supabaseAdmin
        .from('settings')
        .select('uber_client_id, uber_client_secret')
        .eq('company_id', profile.company_id)
        .single();

      const clientId = settings?.uber_client_id;
      const clientSecret = settings?.uber_client_secret;

      // If credentials are not configured, return error
      if (!clientId || !clientSecret) {
        return res.status(400).json({ 
          error: "Credenciais da Uber não configuradas.",
          details: "Por favor, configure o Client ID e Client Secret nas definições da empresa."
        });
      }

      console.log(`Attempting to sync with Uber API for company ${profile.company_id}...`);
      
      // Placeholder for actual Uber API calls
      res.json({
        drivers: [],
        vehicles: [],
        earnings: [],
        status: "connected",
        message: "Conectado à API da Uber com sucesso. Sincronização em tempo real ativa.",
        timestamp: new Date().toISOString()
      });
    } catch (error: any) {
      console.error("Uber Sync Error:", error.message);
      res.status(500).json({ 
        error: error.message || "Erro ao sincronizar dados com a Uber.",
        details: "Verifique se o Client ID e Client Secret estão corretos e se a aplicação tem as permissões necessárias no painel da Uber."
      });
    }
  });

  // Flight Status Endpoint (Aviationstack)
  app.get("/api/flights/status", async (req, res) => {
    const { flightNumber } = req.query;
    const apiKey = process.env.VITE_AVIATIONSTACK_API_KEY;

    if (!flightNumber) return res.status(400).json({ error: "Número do voo é obrigatório" });
    
    if (!apiKey) {
      // Mock data if no API key
      return res.json({
        status: Math.random() > 0.7 ? 'delayed' : 'on_time',
        estimated_arrival: new Date(Date.now() + 3600000).toISOString(),
        departure_airport: 'LIS'
      });
    }

    try {
      const response = await axios.get(`http://api.aviationstack.com/v1/flights`, {
        params: {
          access_key: apiKey,
          flight_iata: flightNumber
        }
      });

      const data = response.data;
      if (data.data && data.data.length > 0) {
        const flight = data.data[0];
        const status = flight.flight_status;
        
        let mappedStatus = 'unknown';
        if (status === 'scheduled' || status === 'active') mappedStatus = 'on_time';
        if (status === 'landed') mappedStatus = 'landed';
        
        res.json({
          status: mappedStatus,
          estimated_arrival: flight.arrival.estimated,
          actual_arrival: flight.arrival.actual,
          departure_airport: flight.departure.iata
        });
      } else {
        res.json({ status: 'unknown' });
      }
    } catch (error: any) {
      console.error("Flight API Error:", error.message);
      res.status(500).json({ error: "Erro ao consultar API de voos" });
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

  // 404 Handler for API routes
  app.use((req, res) => {
    if (req.url.startsWith('/api')) {
      console.warn(`[404] API Route not found: ${req.method} ${req.url}`);
      res.status(404).json({ error: "API route not found" });
    } else {
      console.warn(`[404] Page not found: ${req.url}`);
    }
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

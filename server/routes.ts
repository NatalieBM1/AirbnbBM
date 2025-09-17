import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { loginSchema, registerSchema, insertBookingSchema, insertNotificationSchema, insertPaymentSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "fallback-secret-key";

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      // Create user
      const user = await storage.createUser({
        email: userData.email,
        password: hashedPassword,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
      });

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Create welcome notification
      await storage.createNotification({
        userId: user.id,
        title: "¡Bienvenido a AIRBNBBM!",
        message: "Tu cuenta ha sido creada exitosamente. Comienza a explorar lugares increíbles para hospedarte.",
        type: "security",
      });

      const { password, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Create login notification
      await storage.createNotification({
        userId: user.id,
        title: "¡Bienvenido de vuelta!",
        message: "Has iniciado sesión exitosamente en tu cuenta.",
        type: "security",
      });

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Failed to get user data" });
    }
  });

  // Property routes
  app.get("/api/properties", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const properties = await storage.getProperties(limit, offset);
      res.json({ properties });
    } catch (error) {
      console.error("Get properties error:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json({ property });
    } catch (error) {
      console.error("Get property error:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Booking routes
  app.post("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookingData = insertBookingSchema.parse({
        ...req.body,
        guestId: req.user.userId,
      });

      // Verify property exists
      const property = await storage.getProperty(bookingData.propertyId);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Create booking
      const booking = await storage.createBooking(bookingData);

      // Create booking confirmation notification
      await storage.createNotification({
        userId: req.user.userId,
        title: "Booking confirmed!",
        message: `Your reservation at ${property.title} has been confirmed.`,
        type: "booking",
      });

      res.status(201).json({ booking });
    } catch (error: any) {
      console.error("Create booking error:", error);
      res.status(400).json({ message: error.message || "Failed to create booking" });
    }
  });

  app.get("/api/bookings", authenticateToken, async (req: any, res) => {
    try {
      const bookings = await storage.getBookingsByUser(req.user.userId);
      res.json({ bookings });
    } catch (error) {
      console.error("Get bookings error:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/:id", authenticateToken, async (req: any, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Check if user owns this booking
      if (booking.guestId !== req.user.userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json({ booking });
    } catch (error) {
      console.error("Get booking error:", error);
      res.status(500).json({ message: "Failed to fetch booking" });
    }
  });

  // Notification routes
  app.get("/api/notifications", authenticateToken, async (req: any, res) => {
    try {
      const notifications = await storage.getNotificationsByUser(req.user.userId);
      res.json({ notifications });
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.patch("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
    try {
      const success = await storage.markNotificationAsRead(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Notification not found" });
      }
      res.json({ message: "Notification marked as read" });
    } catch (error) {
      console.error("Mark notification as read error:", error);
      res.status(500).json({ message: "Failed to update notification" });
    }
  });

  // Payment routes
  app.post("/api/payments", authenticateToken, async (req: any, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);

      // Verify booking exists and belongs to user
      const booking = await storage.getBooking(paymentData.bookingId);
      if (!booking || booking.guestId !== req.user.userId) {
        return res.status(404).json({ message: "Booking not found" });
      }

      // Create payment
      const payment = await storage.createPayment({
        ...paymentData,
        status: "completed", // Simulate successful payment
        transactionId: `txn_${Date.now()}`,
      });

      // Update booking status
      await storage.updateBooking(booking.id, { status: "confirmed" });

      // Create payment notification
      await storage.createNotification({
        userId: req.user.userId,
        title: "Payment processed",
        message: `Your payment of $${payment.amount} has been successfully processed.`,
        type: "payment",
      });

      res.status(201).json({ payment });
    } catch (error: any) {
      console.error("Create payment error:", error);
      res.status(400).json({ message: error.message || "Payment failed" });
    }
  });

  app.get("/api/payments/booking/:bookingId", authenticateToken, async (req: any, res) => {
    try {
      // Verify booking belongs to user
      const booking = await storage.getBooking(req.params.bookingId);
      if (!booking || booking.guestId !== req.user.userId) {
        return res.status(404).json({ message: "Booking not found" });
      }

      const payments = await storage.getPaymentsByBooking(req.params.bookingId);
      res.json({ payments });
    } catch (error) {
      console.error("Get payments error:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

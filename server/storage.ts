import { type User, type InsertUser, type Property, type InsertProperty, type Booking, type InsertBooking, type Notification, type InsertNotification, type Payment, type InsertPayment } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Properties
  getProperties(limit?: number, offset?: number): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  getPropertiesByHost(hostId: string): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined>;

  // Bookings
  getBooking(id: string): Promise<Booking | undefined>;
  getBookingsByUser(userId: string): Promise<Booking[]>;
  getBookingsByProperty(propertyId: string): Promise<Booking[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined>;

  // Notifications
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: string): Promise<boolean>;

  // Payments
  getPayment(id: string): Promise<Payment | undefined>;
  getPaymentsByBooking(bookingId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private properties: Map<string, Property> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private payments: Map<string, Payment> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    // Create sample users
    const sampleHost: User = {
      id: "host-1",
      email: "sarah@example.com",
      password: "hashedpassword",
      firstName: "Sarah",
      lastName: "Johnson",
      phone: "+1 (555) 123-4567",
      avatar: "",
      isHost: true,
      createdAt: new Date(),
    };

    const sampleGuest: User = {
      id: "guest-1",
      email: "john@example.com",
      password: "hashedpassword",
      firstName: "John",
      lastName: "Doe",
      phone: "+1 (555) 987-6543",
      avatar: "",
      isHost: false,
      createdAt: new Date(),
    };

    this.users.set(sampleHost.id, sampleHost);
    this.users.set(sampleGuest.id, sampleGuest);

    // Create sample properties
    const sampleProperties: Property[] = [
      {
        id: "prop-1",
        title: "Beachfront Villa in Malibu",
        description: "Escape to this breathtaking beachfront villa in Malibu, where luxury meets the Pacific Ocean. This stunning 4-bedroom, 3-bathroom retreat features floor-to-ceiling windows, an infinity pool, and direct beach access.",
        location: "Malibu, California",
        latitude: "34.0259",
        longitude: "-118.7798",
        pricePerNight: "299.00",
        maxGuests: 8,
        bedrooms: 4,
        bathrooms: 3,
        images: [
          "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
          "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
        ],
        amenities: ["Pool", "WiFi", "Kitchen", "Parking", "TV", "Air conditioning"],
        hostId: "host-1",
        rating: "4.95",
        reviewCount: 127,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prop-2",
        title: "Cozy Mountain Cabin",
        description: "Relax in this charming mountain cabin surrounded by nature. Perfect for a peaceful getaway with hiking trails nearby.",
        location: "Aspen, Colorado",
        latitude: "39.1911",
        longitude: "-106.8175",
        pricePerNight: "189.00",
        maxGuests: 6,
        bedrooms: 3,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Fireplace", "Parking"],
        hostId: "host-1",
        rating: "4.87",
        reviewCount: 89,
        isActive: true,
        createdAt: new Date(),
      },
      {
        id: "prop-3",
        title: "Modern Downtown Loft",
        description: "Stylish loft in the heart of the city with floor-to-ceiling windows and modern amenities.",
        location: "New York, NY",
        latitude: "40.7128",
        longitude: "-74.0060",
        pricePerNight: "159.00",
        maxGuests: 4,
        bedrooms: 2,
        bathrooms: 2,
        images: [
          "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        ],
        amenities: ["WiFi", "Kitchen", "Gym", "Parking"],
        hostId: "host-1",
        rating: "4.92",
        reviewCount: 156,
        isActive: true,
        createdAt: new Date(),
      },
    ];

    sampleProperties.forEach(property => {
      this.properties.set(property.id, property);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      avatar: "",
      isHost: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Property methods
  async getProperties(limit = 20, offset = 0): Promise<Property[]> {
    const allProperties = Array.from(this.properties.values())
      .filter(p => p.isActive)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return allProperties.slice(offset, offset + limit);
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getPropertiesByHost(hostId: string): Promise<Property[]> {
    return Array.from(this.properties.values()).filter(p => p.hostId === hostId);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = {
      ...insertProperty,
      id,
      rating: "0",
      reviewCount: 0,
      isActive: true,
      createdAt: new Date(),
    };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty = { ...property, ...updates };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  // Booking methods
  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async getBookingsByUser(userId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.guestId === userId);
  }

  async getBookingsByProperty(propertyId: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(b => b.propertyId === propertyId);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = {
      ...insertBooking,
      id,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;
    
    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  // Notification methods
  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      isRead: false,
      createdAt: new Date(),
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: string): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.isRead = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Payment methods
  async getPayment(id: string): Promise<Payment | undefined> {
    return this.payments.get(id);
  }

  async getPaymentsByBooking(bookingId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.bookingId === bookingId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = randomUUID();
    const payment: Payment = {
      ...insertPayment,
      id,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;
    
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

export const storage = new MemStorage();

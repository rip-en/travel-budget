import { ObjectId } from 'mongodb';

export default class Holiday {
  constructor(data) {
    this._id = data._id || new ObjectId();
    this.userId = data.userId || null; // Add userId to link holidays to users
    this.title = data.title;
    this.destination = data.destination;
    this.startDate = data.startDate ? new Date(data.startDate) : null;
    this.endDate = data.endDate ? new Date(data.endDate) : null;
    this.budget = data.budget || 0;
    this.expenses = data.expenses || [];
    this.notes = data.notes || '';
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = new Date();
    
    // Image data
    this.imageType = data.imageType || null; // 'upload', 'preset', or null
    this.imageData = data.imageData || null; // Base64 data for uploaded images
    this.imagePreset = data.imagePreset !== undefined ? data.imagePreset : null; // Index for preset images
  }

  // Convert MongoDB document to Holiday object
  static fromDB(doc) {
    return doc ? new Holiday(doc) : null;
  }

  // Convert Holiday object to MongoDB document
  toJSON() {
    return {
      _id: this._id,
      userId: this.userId,
      title: this.title,
      destination: this.destination,
      startDate: this.startDate,
      endDate: this.endDate,
      budget: this.budget,
      expenses: this.expenses,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      imageType: this.imageType,
      imageData: this.imageData,
      imagePreset: this.imagePreset
    };
  }

  // Calculate total expenses
  get totalExpenses() {
    return this.expenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  }

  // Calculate remaining budget
  get remainingBudget() {
    return this.budget - this.totalExpenses;
  }
} 
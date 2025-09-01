import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: "user" | "admin" | "moderator";
  firstName?: string;
  lastName?: string;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  lastLogin?: Date;
  tasks?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    username: { 
      type: String, 
      required: [true, 'Username is required'],
      unique: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens']
    },
    email: { 
      type: String, 
      required: [true, 'Email is required'], 
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: { 
      type: String, 
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters']
    },
    role: { 
      type: String, 
      enum: ['user', 'admin', 'moderator'],
      default: "user" 
    },
    firstName: {
      type: String,
      maxlength: [50, 'First name cannot exceed 50 characters'],
      trim: true
    },
    lastName: {
      type: String,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      trim: true
    },
    avatar: {
      type: String,
      validate: {
        validator: function(v: string) {
          return !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
        },
        message: 'Avatar must be a valid image URL'
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastLogin: {
      type: Date
    },
    tasks: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task'
    }]
  },
  { 
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete (ret as any).password;
        return ret;
      }
    }
  }
);

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function(this: IUser) {
  const parts = [];
  if (this.firstName) parts.push(this.firstName);
  if (this.lastName) parts.push(this.lastName);
  return parts.join(' ') || this.username;
});

// Pre-save middleware to update tasks array when user is referenced in tasks
userSchema.methods.addTask = function(taskId: mongoose.Types.ObjectId) {
  if (!this.tasks.includes(taskId)) {
    this.tasks.push(taskId);
    return this.save();
  }
  return Promise.resolve(this);
};

userSchema.methods.removeTask = function(taskId: mongoose.Types.ObjectId) {
  this.tasks = this.tasks.filter((id: mongoose.Types.ObjectId) => !id.equals(taskId));
  return this.save();
};

export const User = mongoose.model<IUser>("User", userSchema);
export default User;

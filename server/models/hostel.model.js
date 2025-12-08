import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    number: { type: String, required: true },
    occupied: { type: Boolean, default: false },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    floor: { type: Number, default: 0 },
  },
  { _id: false }
);

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    type: { type: String, enum: ["Boys", "Girls", "Coed"], required: true },
    totalRooms: { type: Number, required: true, min: 0 },
    occupiedRooms: { type: Number, default: 0 },
    rooms: { type: [roomSchema], default: [] },
    numberOfFloors: { type: Number, default: 1, min: 1 },
    roomsPerFloor: { type: Number, default: 1, min: 1 },
    warden: { type: String },
    contact: { type: String },
    address: { type: String },
    feePerMonth: { type: Number, default: 0 },
    image: { type: String },
  },
  { timestamps: true }
);

hostelSchema.methods.availableRoomsCount = function () {
  return this.totalRooms - this.occupiedRooms;
};

export const Hostel = mongoose.model("Hostel", hostelSchema);

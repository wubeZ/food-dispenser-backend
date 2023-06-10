import mongoose from "mongoose";


const AddressSchema = new mongoose.Schema(
    {
      city: { type: String, required: true },
      subCity: { type: String, required: true },
      woreda: { type: String, required: false },
      houseNo: { type: String, unique: false },
      street: { type: String, required: false }
    },
    { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
  )
  
const AddressModel = mongoose.model('Address', AddressSchema);

export default AddressModel;
// imported the required modules
const express  = require("express");
const mongoose = require("mongoose");
const bodyparser = require("body-parser")
require('dotenv').config();
// server created
const app = express()
const url = process.env.MONGODB_URL;
// connecting to database
// console.log("MongoDB URL:", process.env.MONGODB_URL);
mongoose.connect(url).then(()=>{
    console.log("Connected with MongoDB")
}).catch((err)=>{
    console.log(err)
})

// using body-parser and express
app.use(bodyparser.urlencoded({extended:false}))
app.use(express.json())

// defining model and schema
const productSchema = new mongoose.Schema({
name :String,
description:String,
price:Number,
})



// Define the customer schema
const customerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  cart: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
],
});

// Create a Customer model based on the schema
const Customer = mongoose.model('Customer', customerSchema);

// Create a new customer
app.post('/api/vi/customers/new', async (req, res) => {
    try {
      const newCustomer = await Customer.create(req.body);
      res.status(201).json(newCustomer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
// read all
app.get('/api/vi/customers/all', async (req, res) => {
    try {
      const allCustomers = await Customer.find();
      res.status(201).json(allCustomers);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Update a customer by ID
app.put('/api/vi/customers/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    try {
      const updatedCustomer = await Customer.findByIdAndUpdate(customerId, req.body, { new: true });
      res.json(updatedCustomer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Delete a customer by ID
  app.delete('/api/vi/customers/:customerId', async (req, res) => {
    const customerId = req.params.customerId;
    try {
      const deletedCustomer = await Customer.findByIdAndDelete(customerId);
      res.json(deletedCustomer);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
// Endpoint to get items in the cart for a particular user
app.get('/api/v1/customers/:customerId/cart', async (req, res) => {
    try {
        const customerId = req.params.customerId;

        // Check if the customer exists
        const customer = await Customer.findById(customerId).populate('cart');

        if (!customer) {
            return res.status(404).json({ error: 'Customer not found' });
        }

        // Respond with the items in the cart
        res.json({ cart: customer.cart });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
// Endpoint to add items to the cart for a particular user

app.post('/api/v1/customers/:customerId/cart/add', async (req, res) => {
    try {
        const customerId = req.params.customerId;
        const productId = req.body.productId; // Assuming you send the product ID in the request body

        // Check if the customer and product exist
        const customer = await Customer.findById(customerId);
        const product = await Product.findById(productId);

        if (!customer || !product) {
            return res.status(404).json({ error: 'Customer or Product not found' });
        }

        // Add the product to the customer's cart
        customer.cart.push(product);
        await customer.save();

        res.json({ message: 'Product added to cart successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Create a Product model based on the schema
const Product = new mongoose.model("Product",productSchema)

// post request for creating objects of schema
app.post("/api/v1/product/new", async (req,res)=>{
   const product = await Product.create(req.body);

    res.status(200).json({
        success:true,
        product
    })
})

// Read product

app.get("/api/v1/products",async(req,res)=>{
   
    const products = await Product.find();
    res.status(200).json(
        {
            success:true,
            products
        }
    )
})

// update product

app.put("/api/v1/product/:id",async(req,res)=>{
    let product = await Product.findById(req.params.id)
    
    if(!product){
        return res.status(404).json({
            success:false,
            message:"product not found"
        })
    }
    

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        useFindAndModify:false,
        runValidators:true
    })

   
    res.status(200).json({
        success:true,
        product,
        message:"product " + req.params.id + " is updated successfully "
    })
})

// delete product

app.delete("/api/v1/product/:id",async(req,res)=>{

    const product = await Product.findById(req.params.id);
    if(!product){
        return res.status(500).json({
            success:false,
            message:"product not found"
        })
    }

    await product.deleteOne();

    res.status(200).json({
        success:true,
        message:"product " + req.params.id + " is deleted successfully " 
    })
})

app.get('/',(req,res)=>{
     res.send("Working Fine")
})

app.get('/home',(req,res)=>{
  res.send("Home Page")
})
app.listen(4500,()=>{
    console.log("Server is working http://localhost:4500")
})

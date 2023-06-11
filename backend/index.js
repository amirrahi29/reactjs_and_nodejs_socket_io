const http = require('http');
const express = require('express');
const cors = require('cors');
const socketIO = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 8000;

// Connect to MongoDB using Mongoose
mongoose
  .connect('mongodb://127.0.0.1:27017/amirrahisocket', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));

// Define a Product schema using Mongoose
const productSchema = new mongoose.Schema({
  id: String,
  title: String,
});

// Create a Product model using the schema
const Product = mongoose.model('Product', productSchema);

app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello, it\'s working!');
});

app.get('/products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json({ products });
  } catch (error) {
    console.error('Error retrieving products:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const server = http.createServer(app);
const io = socketIO(server);

io.on('connection', async (socket) => {
  console.log('New Connection');

  try {
    const products = await Product.find({});
    socket.emit('products', { products });
  } catch (error) {
    console.error('Error retrieving products:', error);
  }

  socket.on('chatMessage', async (message) => {
    console.log(`Node Msg: ${message.message}, Node ID: ${message.id}`);
    io.emit('chatMessage', { message: message.message, id: message.id });

    try {
      await saveProduct(message.message, message.id);
      const products = await Product.find({});
      io.emit('products', { products });
    } catch (error) {
      console.error('Error saving product:', error);
    }
  });

  socket.on('deleteProduct', async (message) => {
    console.log(message.product_id);
    try {
      const deletedProduct = await Product.findByIdAndDelete(message.product_id);
      console.log('Product deleted:', deletedProduct);

      const products = await Product.find({});
      io.emit('products', { products });
      
    } catch (error) {
      console.error('Error saving product:', error);
    }
  });


  socket.on('disconnect', () => {
    socket.broadcast.emit('leave', {
      user: 'Admin',
      message: `${socket.id} has left`,
    });
    console.log('User left');
  });
});

const saveProduct = async (message, id) => {
  try {
    const newProduct = new Product({
      id: id,
      title: message,
    });

    await newProduct.save();
    console.log('Product saved:', newProduct);
  } catch (error) {
    console.error('Error saving product:', error);
  }
};

server.listen(port, () => {
  console.log(`Server running on ${port}`);
});
